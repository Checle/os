import PathLoader from '@record/node-module-loader'
import Process from '../../sys/kernel/process.js'
import {Loader} from '../../lib/web/loader.js'

export default class URLLoader extends PathLoader {
  async [Loader.resolve] (key, parent) {
    // TODO: resolve mount 
    if (key.substr(0, 8) === 'file:///') {
      let pathname =Process.current.root +  decodeURIComponent(key.substr(7))

      // Check if module exists
      if (!await super[Loader.resolve](pathname)) return
    } else {
      key = decodeURIComponent(key)
    }

    return key
  }

  async [Loader.resolveInstantiate] (key, parent) {
    key = await this[Loader.resolve](key, parent)

    if (key != null && key.indexOf(':') === -1) {
      return await super[Loader.resolveInstantiate](key)
    }
  }
}
