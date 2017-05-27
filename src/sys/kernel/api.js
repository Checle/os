import * as libc from '../../lib/libc.js'
import Process from './process.js'
import SystemLoader from './loader.js'
import {read, SEEK_SET, X_OK} from '../../lib/libc.js'
import {SystemError} from './errors.js'
import {WorkerGlobalScope} from '../../lib/libweb.js'

export * from './api/io.js'
export * from './api/mount.js'

export function getpid () {
  return this.process.id
}

export function getuid () {
  return this.process.uid
}

export function getgid () {
  return this.process.gid
}

export function setuid (uid) {
  const process = this.process

  if (process.uid !== 0) throw new Error('EPERM')

  process.uid = uid
}

export function setgid (gid) {
  if (this.process.uid !== 0) throw new Error('EPERM')

  this.process.gid = gid
}

export function getcwd () {
  return this.process.cwd
}

export function getenc () {
  return this.process.encoding
}

export function setenc (encoding) {
  this.process.encoding = encoding
}

export async function chdir (path) {
  path = await this.realpath(path)

  this.process.cwd = path
}

export async function chroot (path) {
  if (this.process.uid !== 0) throw new Error('EPERM')

  path = this.process.root + await this.realpath(path)

  this.process.root = path
}

export function getenv (name) {
  let env = this.process.env

  if (!env.hasOwnProperty(name)) return null

  return env[name]
}

export function setenv (envname, envval, overwrite = true) {
  let env = this.process.env

  if (env.hasOwnProperty(envname) && !overwrite) return

  env[envname] = envval
}

export function clone (fn, thisArg, flags, ...args) {
  let process = this.process
  let child = process.spawn()

  setTimeout(() => child.run(fn, thisArg, ...args), 0)

  return child.id
}

export function exit (status) {
  this.process.terminate(status || null)

  // Promise that does not resolve
  return new Promise(() => null)
}

export async function readfile (filename) {
  let fd = await this.open(filename)

  try {
    return await read(fd)
  } finally {
    await this.close(fd)
  }
}

export async function instantiate (key, parent) {
  let process = this.process

  if (process.uid === 0 && key[0] !== '.' && key[0] !== '/' && key.indexOf(':') === -1) {
    if (typeof require === 'function') {
      let exports = require(key)

      if (typeof exports !== 'object') {
        exports = {default: exports}
      }

      return exports
    }
  }
}

export async function execvp (pathname, argv = []) {
  // Resolve pathname against `PATH`
  // POSIX requires any pathname containing a slash to be referenced to a local context
  let paths = pathname.indexOf('/') === -1 ? this.process.env.PATH : this.process.cwd

  pathname = await this.resolve(pathname, paths)

  return await this.execv(pathname, argv)
}

export async function execv (path, argv = []) {
  let process = this.process
  let exports

  await this.access(path, X_OK)

  let href = new URL(encodeURIComponent(path).replace(/%2F/g, '/'), 'file:///').href
  let endowments = new WorkerGlobalScope(href)
  let system = new SystemLoader()

  Object.defineProperty(endowments, 'System', {value: system})

  process.system = system
  process.realm = {
    global,
    eval: eval,
  } // TODO: new Realm(endowments)
  process.path = path
  process.arguments = argv.slice()

  let fd = await this.open(path)

  try {
    let magic = await read(fd, undefined, 2)

    await this.lseek(fd, 0, SEEK_SET)

    if (magic === '#!') {
      let [interpreter, optionalArg] = /^(.*?)(?: (.*))?(?:\n|$)/.exec(await read(fd))

      return this.execv(interpreter, [optionalArg, ...argv])
    }

    if (magic[0] === '\0') {
      let buffer = await read(fd, null)
      let {module, instance} = await WebAssembly.instantiate(buffer, process.api)

      exports = instance.exports
    } else {
      exports = await system.import(path)
    }
  } finally {
    await this.close(fd)
  }

  if (typeof exports.default === 'function') {
    // Run main async functionhronously, pass `argv[0]` as `this` and subsequent values as `arguments`
    let status = await exports.default(...argv)

    // Report exit code
    this.exit(Number(status))
  }

  // Promise that never resolves (see POSIX)
  return new Promise(() => null)
}

export function dup (filedes) {
  this.process.files.add(this.process.files.get(filedes))
}

export function dup2 (filedes, filedes2) {
  this.process.files.set(filedes, this.process.files.get(filedes))
}

export function waitpid (pid, options) {
  return new Promise((resolve, reject) => {
    let process = this.process.namespace.processes.get(pid)

    if (!process) reject(new Error('ECHILD'))

    process.addEventListener('finish', event => resolve(process.status))
  })
}

let defaultAction = {
  handler: sig => {
    this.process.cancel()
  }
}

export function kill (pid, sig) {
  let process = this.process.namespace.processes.get(pid)

  if (!process) throw new Error('ESRCH')

  let action = this.process.actions[sig] || defaultAction

  action.handler(sig)
}

export function evaluate (code) {
  return this.process.realm.eval(code)
}

export async function uselib (library) {
  // TODO: also freeze and add to global import loader registry

  let process = this.process

  if (process.uid !== 0) throw new Error('EPERM')

  if (typeof library === 'string') {
    library = await new Promise(resolve => {
      this.clone(async () => {
        let filename = resolve(library, process.env.IMPORTPATH)
        let code = this.readfile(filename)
        let {module, instance} = await WebAssembly.instantiate(code, process.scope)

        resolve(instance.exports)
      })
    })
  }

  let namespace = process.namespace

  namespace.api = Object.create(namespace.api)

  Object.assign(namespace.api, library)
  Object.assign(process.api, library)
}

export async function resolve (filename, paths, extensions = ['']) {
  if (filename[0] === '/') return await this.realpath(filename)

  if (paths == null) paths.push(this.process.cwd)
  else if (typeof paths === 'string') paths = paths.split(':')

  for (let path of paths) if (path != null) {
    for (let extension of extensions) {
      try {
        return await this.realpath(path + '/' + filename + extension)
      } catch (error) { }
    }
  }
}
