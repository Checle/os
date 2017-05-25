import Process from './process.js'
import {resolve} from './api.js'
import {fetch, Loader} from '../../lib/libweb.js'
import {getcwd, getenv, realpath} from '../../lib/libc.js'

export default new class extends Loader {
  async [Loader.resolve] (key, parent) {
    let process = zone.process

    if (key.indexOf(':') === -1 && key[0] !== '.' && key[0] !== '/') {
      let filename = decodeURI(key)

      filename = await resolve(filename, process.env.IMPORTPATH)

      // Encodes special chars such as '#'
      return 'file://' + encodeURIComponent(filename.substr(rootpath.length)).replace(/%2F/, '/')
    }

    // Otherwise, key is a valid URL input
    key = new URL(key, parent || location.href).href

    return process.loader !== null && await process.loader.resolve(key, parent)
      || process.namespace.loader !== null && await process.namespace.loader.resolve(key, parent)
      || key
  }

  async [Loader.resolveInstantiate] (key, parent) {
    let process = zone.process

    // TODO: avoid double resolve

    if (await process.loader.resolve(key, parent)) {
      return await loader.import(key)
    }

    if (await process.namespace.loader.resolve(key, parent)) {
      return await process.namespace.loader.import(key)
    }

    let response = await fetch(key)
    let text = await response.text()
    let result = process.realm.eval(text)

    if (result != null && result[Symbol.toStringTag] === 'Module') {
      return result
    }

    // TODO: register
    if (true) {
      return {}
    }

    throw new TypeError(key + ' is not a module')
  }
}
