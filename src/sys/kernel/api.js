import Process from './process.js'
import {instantiate} from '@record/web-assembly'
import {X_OK} from '../../lib/libc.js'

export default class Api {
  get process () {
    return Process.current
  }

  async readfile (filename) {
    let fd = await this.open(filename)
    let buffers = []
    let encoder = new TextEncoder('utf-8')

    do {
      let buffer = new Uint8Array(BUFSIZ)

      if (await this.read(fd, buffer) <= 0) break

      buffers.push(buffer)
    } while (true)

    return encoder.encode(Uint8Array.of(...buffers))
  }

  getpid () {
    return this.process.id
  }

  getuid () {
    return this.process.uid
  }

  getgid () {
    return this.process.gid
  }

  setuid (uid) {
    const process = this.process

    if (process.uid !== 0) throw new Error('EPERM')

    process.uid = uid
  }

  setgid (gid) {
    if (this.process.uid !== 0) throw new Error('EPERM')

    this.process.gid = gid
  }

  getcwd () {
    return this.process.cwd
  }

  async chdir (path) {
    path = await realpath(path)

    this.process.cwd = path
  }

  access (path, amode) {
    return 0
  }

  clone (fn, thisArg, flags, ...args) {
    let child = new Process(this.process)

    child.run(fn, thisArg, args)

    return child.id
  }

  exit (status) {
    this.process.terminate(status || null)

    // Promise that does not resolve
    return new Promise(() => null)
  }

  async execv (pathname, argv = []) {
    let process = this.process

    // POSIX requires any pathname containing a slash to be referenced to a local context
    pathname = pathname.indexOf('/') === -1 ? pathname : './' + pathname

    // Resolve pathname against `PATH` and enable native module resolution such as filename extension
    let filename = await this.resolve(pathname, null, this.process.env.PATH)

    await this.access(filename, X_OK)

    process.path = filename
    process.arguments = argv.slice()

    let code = this.readfile(filename)
    let {module, instance} = await instantiate(code, this.process.scope)
    let exports = module.exports

    if (typeof exports.default === 'function') {
      // Run main function asynchronously, pass `argv[0]` as `this` and subsequent values as `arguments`
      let status = await exports.default(...argv)

      // Report exit code
      exit(Number(status))
    }

    // Promise that never resolves (see POSIX)
    return new Promise(() => null)
  }

  async realpath (filename) {
    return new URL(filename, 'file://' + this.process.cwd).pathname
  }

  dup (filedes) {
    this.process.files.add(this.process.files.get(filedes))
  }

  dup2 (filedes, filedes2) {
    this.process.files.set(filedes, this.process.files.get(filedes))
  }

  waitpid (pid, options) {
    return new Promise((resolve, reject) => {
      let process = this.process.namespace.processes.get(pid)

      if (!process) reject(new Error('ECHILD'))

      process.then(status => resolve(status), error => reject(error))
    })
  }

  defaultAction = {
    handler: sig => {
      this.process.cancel()
    }
  }

  kill (pid, sig) {
    let process = this.process.namespace.processes.get(pid)

    if (!process) throw new Error('ESRCH')

    let action = this.process.actions[sig] || this.defaultAction

    action.handler(sig)
  }

  async resolve (filename, base = null, path = null) {
    let paths = path ? path.split(':') : [null]

    if (base != null) throw 'Not implemented'

    for (let dirname of paths) {
      try {
        let path = await this.realpath(filename, dirname)

        return path
      } catch (e) { }
    }

    throw new Error('ENOENT')
  }

  async uselib (library) {
    if (this.process.uid !== 0) throw new Error('EPERM')

    if (typeof library === 'string') {
      let filename = this.resolve(library, null, this.process.env.IMPORTPATH)
      let code = this.readfile(filename)
      let {module, instance} = await instantiate(code, this.process.scope)

      library = instance.exports
    }

    let namespace = this.process.namespace

    namespace.api = Object.create(namespace.api)

    Object.assign(namespace.api, library)
    Object.assign(this.process.api, library)
  }
}
