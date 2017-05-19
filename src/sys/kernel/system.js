import Process from './process.js'
import {resolve} from './api.js'
import {fetch, Loader} from '../../lib/libweb.js'
import {getcwd, getenv, realpath} from '../../lib/libc.js'

export default function createSystem (loader) {
  return new class System extends Loader {
    async [Loader.resolve] (key, parent) {
      console.log(key, parent)
      if (key.indexOf(':') === -1 && key[0] !== '.' && key[0] !== '/') {
        let filename = decodeURI(key)

        filename = await resolve(filename, Process.current.env.IMPORTPATH)

        // Encodes special chars such as '#'
        return 'file://' + encodeURIComponent(filename.substr(root.length)).replace(/%2F/, '/')
      }

      // Otherwise, key is a valid URL input
      key = new URL(key, parent || location.href).href

      return await loader.resolve(key, parent) || key
    }

    async [Loader.resolveInstantiate] (key, parent) {
      let target = await loader.resolve(key, parent)

      if (target) return await loader.import(key)

      let response = await fetch(key)
      let text = await response.text()
      let fn = new Function(text)

      // TODO: register
      fn()
    }
  }
}
