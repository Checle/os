import * as path from 'path'
import Loader from './loader'
import Process from '../../sys/kernel/process.js'
import VFS from './vfs.js'

export default class NodeProcess extends Process {
  cwd = process.cwd()
  env = Object.assign({}, process.env)
  arguments = process.argv.slice(1)
  path = process.execPath

  realm = {
    global,

    eval: eval,
  }

  constructor (options) {
    super()

    if (options == null) options = {}

    process.on('unhandledRejection', (reason, promise) => { throw reason })

    if (options.node) {
      this.namespace.loader = new Loader()
    }

    if (options.clean) {
      return
    }

    let rootpath = path.dirname(path.dirname(__dirname))
    let vfs = new VFS()

    this.namespace.mounts.set('', vfs)
    //namespace.mounts.set(path.join(rootpath, 'usr/lib'), path.resolve(rootpath, '../node_modules'))

    if (!options.rootpath) {
      this.rootpath = rootpath

      this.namespace.mounts.set('/usr/local', vfs)

      // Load Record FS driver
      // On init: if DB non-existing, bootstrap - copy rootpath folder recursively

      this.cwd = '/usr/local' + this.cwd
    }
  }
}
