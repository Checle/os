import {dirname} from '../../lib/libc.js'
import {BrowserLoader} from '../../lib/libweb.js'
import {RegisterLoader, ModuleNamespace} from '@record/node-module-loader'

// TODO: rewrite RegisterLoader such that register registers automously and returns module (eval'able); then use this feature also in BrowserLoader; place in lib/web/system

export default class SystemLoader extends RegisterLoader {
  loader = null

  constructor (process) {
    super()

    this[RegisterLoader.resolve] = async (key, parent) => {
      if (this.loader != null) {
        return await this.loader.resolve(key, parent)
      }

      if (key[0] !== '.' && key[0] !== '/') {
        return await process.api.resolve(key, process.env.IMPORTPATH, '.js') || key
      }

      return await process.api.resolve(key, dirname(parent || process.path))
    }

    this[RegisterLoader.instantiate] = async (key, processAnonRegister) => {
      if (this.loader != null) {
        return await this.loader.import(key)
      }

      // Support native Node.js modules if superuser
      if (process.uid === 0 && key[0] !== '.' && key[0] !== '/' && key.indexOf(':') === -1) {
        if (typeof System === 'function') {
          let resolvedKey

          try {
            resolvedKey = require.resolve(key)
          } catch (e) { }

          if (resolvedKey) {
            let exports = require(resolvedKey)

            if (typeof exports !== 'object') {
              exports = {default: exports}
            }

            return new ModuleNamespace(exports)
          }
        }
      }

      let api = process.api
      let fd = await api.open(key)
      let text

      try {
        text = await api.read(fd)
      } finally {
        await api.close(fd)
      }

      process.realm.eval(text)

      processAnonRegister()
    }
  }
}
