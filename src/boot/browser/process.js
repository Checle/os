import Process from '../../sys/kernel/process.js'

export default class BrowserProcess extends Process {
  path = decodeURI(location.pathname)

  constructor () {
    super()

    this.cwd = this.api.dirname(this.path)
  }

  realm = {
    eval: eval,
    global: self,
  }
}
