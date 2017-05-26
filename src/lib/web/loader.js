// https://whatwg.github.io/loader/

import {Loader, ModuleNamespace, RegisterLoader} from '@record/node-module-loader'
import {fetch} from './fetch.js'
import {evaluate, resolve, instantiate} from '../c/sys/record.js'
import {getcwd, getenv, getuid} from '../libc.js'

export {Loader}

const NODE = Symbol('NODE')

function keyOf (path) {
  return 'file://' + encodeURIComponent(path).replace(/%2F/g, '/')
}

export class BrowserLoader extends RegisterLoader {
  async [RegisterLoader.resolve] (key, parent) {
    if (key[0] === '.' || key[0] === '/' || key.indexOf(':') !== -1) {
      return new URL(key, parent || keyOf(await getcwd())).href
    } else {
      let filename = decodeURI(key)

      filename = await resolve(filename, await getenv('IMPORTPATH'), ['', '.js'])

      if (filename == null) return key

      // Encodes special chars such as '#'
      return keyOf(filename)
    }
  }

  async [RegisterLoader.instantiate] (key, processAnonRegister) {
    try {
      let module = await instantiate(key)

      if (module != null) return new ModuleNamespace(module)
    } catch (error) { console.warn(error) }

    let response = await fetch(key)
    let text = await response.text()
    let result

    let lastSystem = global.System

    global.System = this // TODO: remove

    try {
      result = await global.eval(text) // TODO: evaluate(text)
    } finally {
      global.System = lastSystem
    }

    if (result != null && result[Symbol.toStringTag] === 'Module') {
      return result
    }

    processAnonRegister()
  }
}

export default Loader
