import * as c from '../../lib/libc.js'
import Process from './process.js'
import {instantiate} from '@record/web-assembly'
import {access, open, realpath, BUFSIZ, X_OK} from '../../lib/libc.js'

export * from './api/io.js'
export * from './api/mount.js'

export function getpid () {
  return Process.current.id
}

export function getuid () {
  return Process.current.uid
}

export function getgid () {
  return Process.current.gid
}

export function setuid (uid) {
  const process = Process.current

  if (process.uid !== 0) throw new Error('EPERM')

  process.uid = uid
}

export function setgid (gid) {
  if (Process.current.uid !== 0) throw new Error('EPERM')

  Process.current.gid = gid
}

export function getcwd () {
  return Process.current.cwd
}

export function getenv (name) {
  let env = Process.current.env

  if (!env.hasOwnProperty(name)) return null

  return env[name]
}

export function setenv (envname, envval, overwrite = true) {
  let env = Process.current.env

  if (env.hasOwnProperty(envname) && !overwrite) return

  env[envname] = envval
}

export async function chdir (path) {
  path = await realpath(path)

  Process.current.cwd = path
}

export function clone (fn, thisArg, flags, ...args) {
  let child = new Process(Process.current)

  setTimeout(() => child.run(fn, thisArg, args), 0)

  return child.id
}

export function exit (status) {
  Process.current.terminate(status || null)

  // Promise that does not resolve
  return new Promise(() => null)
}

export async function execv (pathname, argv = []) {
  let process = Process.current

  // Resolve pathname against `PATH` and enable native module resolution such as filename extension
  // POSIX requires any pathname containing a slash to be referenced to a local context
  let paths = pathname.indexOf('/') === -1 ? [Process.current.cwd] : Process.current.env.PATH.split(':')
  let filename = await resolve(pathname, ...paths)

  await access(filename, X_OK)

  process.path = filename
  process.arguments = argv.slice()

  let code = await readfile(filename)
  let importObject = Object.create(Process.current.scope)
  let match = /^#!(.*?)(?: (.*))\n/.exec(code)

  // Interpret shebang
  if (match) {
    let [interpreter, optionalArg] = match

    return execv(interpreter, [optionalArg, ...argv])
  }

  Object.assign(importObject, {})

  let {module, instance} = await instantiate(code, importObject)
  let exports = instance.exports

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
  Process.current.files.add(Process.current.files.get(filedes))
}

export function dup2 (filedes, filedes2) {
  Process.current.files.set(filedes, Process.current.files.get(filedes))
}

export function waitpid (pid, options) {
  return new Promise((resolve, reject) => {
    let process = Process.current.namespace.processes.get(pid)

    if (!process) reject(new Error('ECHILD'))

    process.then(status => resolve(status), error => reject(error))
  })
}

let defaultAction = {
  handler: sig => {
    Process.current.cancel()
  }
}

export function kill (pid, sig) {
  let process = Process.current.namespace.processes.get(pid)

  if (!process) throw new Error('ESRCH')

  let action = Process.current.actions[sig] || defaultAction

  action.handler(sig)
}

export async function uselib (library) {
  let process = Process.current

  if (process.uid !== 0) throw new Error('EPERM')

  if (typeof library === 'string') {
    library = await new Promise(resolve => {
      clone(async () => {
        let filename = resolve(library, process.env.IMPORTPATH)
        let code = readfile(filename)
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

export async function read (fildes, buf, nbyte) {
  if (buf != null) {
    return unistd.read(fildes, buf, nbyte == null ? buf.length : nbyte)
  }

  let decoder = new TextDecoder('utf-8')
  let buffers = []
  let length = 0

  do {
    let buffer = new Uint8Array(nbyte == null ? BUFSIZ : Math.min(BUFSIZ, nbyte - length))
    let n = await read(fildes, buffer)

    if (n <= 0) break

    buffers.push(buffer.slice(0, n))

    length += n
  } while (nbyte == null || length < nbyte)

  let array = new Uint8Array(length)
  let i = 0

  for (let buffer of buffers) {
    array.set(buffer, i)

    i += buffer.length
  }

  return decoder.decode(array)
}

export async function readfile (filename) {
  let fd = await open(filename)

  return read(fd)
}

export async function resolve (filename, ...paths) {
  if (paths.length === 0) paths.push(Process.current.cwd)
  if (filename[0] === '/') paths = ['']

  for (let dirname of paths) {
    try {
      return await realpath(dirname + '/' + filename)
    } catch (error) { }
  }
}
