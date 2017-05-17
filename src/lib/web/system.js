import RegisterLoader from 'es-module-loader/core/register-loader.js'
import {getenv, realpath} from '../stdlib'

class SystemLoader extends RegisterLoader {
  async [RegisterLoader.resolve] (key, parent) {
    try {
      syscall('resolve', key, parent)
    } catch (e) {
      return super[RegisterLoader.resolve](key, parent)
    }
  }

  async [RegisterLoader.instantiate] (key, processAnonRegister) {
    let response = await fetch(key)
    let text = await response.text()
    let fn = new Function(text)

    fn()
    processAnonRegister()
  }
}

export let System = new SystemLoader()
