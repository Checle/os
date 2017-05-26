import {BrowserLoader} from '../../lib/libweb.js'
import {RegisterLoader} from '@record/node-module-loader'

export default class SystemLoader extends RegisterLoader {
  loader = new BrowserLoader()

  async [RegisterLoader.resolve] (key, parent) {
    return await this.loader.resolve(key, parent)
  }

  async [RegisterLoader.instantiate] (key) {
    return await this.loader.import(key)
  }
}
