import * as libc from '../../lib/libc.js'
import Process from './process.js'
import loader from './loader.js'
import {read, X_OK} from '../../lib/libc.js'

export * from './api/io.js'
export * from './api/mount.js'

export function getpid () {
  return zone.process.id
}

export function getuid () {
  return zone.process.uid
}

export function getgid () {
  return zone.process.gid
}

export function setuid (uid) {
  const process = zone.process

  if (process.uid !== 0) throw new Error('EPERM')

  process.uid = uid
}

export function setgid (gid) {
  if (zone.process.uid !== 0) throw new Error('EPERM')

  zone.process.gid = gid
}

export function getcwd () {
  return zone.process.cwd
}

export function getenc () {
  return zone.process.encoding
}

export function setenc (encoding) {
  zone.process.encoding = encoding
}

export async function chdir (path) {
  path = await this.realpath(path)

  zone.process.cwd = path
}

export async function chroot (path) {
  if (zone.process.uid !== 0) throw new Error('EPERM')

  path = zone.process.rootpath + await this.realpath(path)

  zone.process.rootpath = path
}

export function getenv (name) {
  let env = zone.process.env

  if (!env.hasOwnProperty(name)) return null

  return env[name]
}

export function setenv (envname, envval, overwrite = true) {
  let env = zone.process.env

  if (env.hasOwnProperty(envname) && !overwrite) return

  env[envname] = envval
}

export function clone (fn, thisArg, flags, ...args) {
  let child = new Process(zone.process)

  setTimeout(() => child.run(fn, thisArg, ...args), 0)

  return child.id
}

export function exit (status) {
  zone.process.terminate(status || null)

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

export async function execvp (pathname, argv = []) {
  // Resolve pathname against `PATH`
  // POSIX requires any pathname containing a slash to be referenced to a local context
  let paths = pathname.indexOf('/') === -1 ? zone.process.cwd : zone.process.env.PATH

  pathname = await resolve(pathname, paths)

  return await execv(pathname, argv)
}

export async function execv (path, argv = []) {
  let process = zone.process
  let exports

  await this.access(path, X_OK)

  process.path = path
  process.arguments = argv.slice()

  let fd, magic

  try {
    fd = await this.open(path)
    magic = await read(fd, undefined, 2)

    if (magic === '#!') {
      let [interpreter, optionalArg] = /^(.*?)(?: (.*))?(?:\n|$)/.exec(await read(fd))

      return execv(interpreter, [optionalArg, ...argv])
    }

    if (magic[0] === '\0') {
      await this.lseek(0)

      let buffer = await read(fd, null)
      let {module, instance} = await WebAssembly.instantiate(buffer, process.api)

      exports = instance.exports
    } else {
      exports = await loader.import(new URL(encodeURIComponent(path), 'file:///').href)
    }
  } finally {
    await this.close(fd)
  }

  if (typeof exports.default === 'function') {
    // Run main async functionhronously, pass `argv[0]` as `this` and subsequent values as `arguments`
    let status = await exports.default(...argv)

    // Report exit code
    exit(Number(status))
  }

  // Promise that never resolves (see POSIX)
  return new Promise(() => null)
}

export function dup (filedes) {
  zone.process.files.add(zone.process.files.get(filedes))
}

export function dup2 (filedes, filedes2) {
  zone.process.files.set(filedes, zone.process.files.get(filedes))
}

export function waitpid (pid, options) {
  return new Promise((resolve, reject) => {
    let process = zone.process.namespace.processes.get(pid)

    if (!process) reject(new Error('ECHILD'))

    process.then(status => resolve(status), error => reject(error))
  })
}

let defaultAction = {
  handler: sig => {
    zone.process.cancel()
  }
}

export function kill (pid, sig) {
  let process = zone.process.namespace.processes.get(pid)

  if (!process) throw new Error('ESRCH')

  let action = zone.process.actions[sig] || defaultAction

  action.handler(sig)
}

export async function uselib (library) {
  // TODO: also freeze and add to global import loader registry

  let process = zone.process

  if (process.uid !== 0) throw new Error('EPERM')

  if (typeof library === 'string') {
    library = await new Promise(resolve => {
      clone(async () => {
        let filename = resolve(library, process.env.IMPORTPATH)
        let code = this.readfile(filename)
        let {module, instance} = await instantiate(code, process.scope)

        resolve(instance.exports)
      })
    })
  }

  let namespace = process.namespace

  namespace.api = Object.create(namespace.api)

  Object.assign(namespace.api, library)
  Object.assign(process.api, library)
}

export async function resolve (filename, ...paths) {
  if (filename[0] === '/') return await this.realpath(filename)

  paths = paths.filter(value => value)

  if (paths.length === 0) paths.push(zone.process.cwd)

  for (let path of paths) {
    if (path != null) {
      for (let dirname of path.split(':')) {
        try {
          return await this.realpath(dirname + '/' + filename)
        } catch (error) { }
      }
    }
  }
}
