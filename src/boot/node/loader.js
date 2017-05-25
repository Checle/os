import * as path from 'path'
import PathLoader from '@record/node-module-loader'
import Process from '../../sys/kernel/process.js'
import {Loader} from '../../lib/web/loader.js'

export default class URLLoader extends PathLoader {
  async [Loader.resolve] (key, parent) {
    let pathname

    // TODO: resolve mount 
    if (key.substr(0, 8) === 'file:///') {
      pathname = Process.current.rootpath + decodeURIComponent(key.substr(7))
    } else if (key.indexOf(':') !== -1) {
      return
    } else {
      pathname = decodeURI(key)
    }

    // Check if module exists
    return await super[Loader.resolve](pathname, parent)
  }

  async [Loader.resolveInstantiate] (key, parent) {
    let resolvedKey = await this[Loader.resolve](key, parent)

    if (!resolvedKey || resolvedKey.indexOf(':') !== -1) throw new Error('Module not found')

    return await super[Loader.resolveInstantiate](resolvedKey)
  }
}
