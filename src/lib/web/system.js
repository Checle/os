import RegisterLoader from 'es-module-loader/core/register-loader.js'
import {getenv, realpath} from '../stdlib'

async function resolve (filename, path) {
  let [basename] = filename.split('/', 1)

  for (let dirname of path.split(':')) {
    try {
      let path = await realpath(filename, dirname)

      return path
    } catch (e) { }
  }
}

class SystemLoader extends RegisterLoader {
  async [RegisterLoader.resolve] (key, parent) {
    let path = await getenv('IMPORTPATH')
    let result = await resolve(key, path)

    if (result !== undefined) return result

    return super[RegisterLoader.resolve](key, parent)
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
