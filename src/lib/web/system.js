import RegisterLoader from '../../sys/utils/loader/register-loader.js'
import {getcwd, getenv, realpath} from '../libc.js'

class SystemLoader extends RegisterLoader {
  async [RegisterLoader.resolve] (key, parent) {
    let result

    if (key[0] === '.') {
      return super[RegisterLoader.resolve](key, parent)
    }

    return await syscall('resolve', key, (await getenv('IMPORTPATH')).split(':'))
  }

  async [RegisterLoader.instantiate] (key, processAnonRegister) {
    let response = await fetch(key)
    let text = await response.text()
    let fn = new Function(text)

    fn()
    processAnonRegister()
  }
}

export var System = new SystemLoader()

export default System
