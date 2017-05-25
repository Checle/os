import {BUFSIZ} from './stdio.js'

export {branch, chroot, clone, uselib} from './sys/record.js'

export const SEEK_CUR = 2
export const SEEK_END = 3
export const SEEK_SET = 1
export const STDIN_FILENO = 0
export const STDOUT_FILENO = 1
export const STDERR_FILENO = 2
export const R_OK = 1
export const W_OK = 2
export const X_OK = 4
export const F_OK = 8

export function access (path, amode) {
  return syscall('access', ...arguments)
}

export function chown (path, owner, group) {
  return syscall('chown', ...arguments)
}

export function close (fildes) {
  return syscall('close', ...arguments)
}

export function fchown (fildes, owner, group) {
  return syscall('fchown', ...arguments)
}

export function fdatasync (fildes) {
  return syscall('fdatasync', ...arguments)
}

export function fsync (fildes) {
  return syscall('fsync', ...arguments)
}

export function ftruncate (fildes, length) {
  return syscall('ftruncate', ...arguments)
}

export function lchmod (path, mode) {
  return syscall('lchmod', ...arguments)
}

export function lchown (path, owner, group) {
  return syscall('lchown', ...arguments)
}

export function link (path1, path2) {
  return syscall('link', ...arguments)
}

export function lseek (fildes, offset, whence) {
  if (whence == null) whence = offset < 0 ? SEEK_END : SEEK_SET

  return syscall('lseek', fildes, offset, whence)
}

export function mkdtemp (template) {
  return syscall('mkdtemp', ...arguments)
}

export function pread () {
  return syscall('pread', ...arguments)
}

export function pwrite (fildes, buf, nbyte, offset) {
  return syscall('pwrite', ...arguments)
}

export async function read (fildes, res, nbyte) {
  if (res === undefined) res = await syscall('getenc')

  if (res !== null && typeof res !== 'string') {
    return syscall('read', fildes, res, nbyte == null ? res.length : nbyte)
  }

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

  if (res === null) return array

  let decoder = new TextDecoder(res)

  return decoder.decode(array)
}

export function readlink (path) {
  return syscall('readlink', ...arguments)
}

export function rmdir (path) {
  return syscall('rmdir', ...arguments)
}

export function symlink (path1, path2) {
  return syscall('symlink', ...arguments)
}

export function truncate (path, length) {
  return syscall('truncate', ...arguments)
}

export function unlink (path) {
  return syscall('unlink', ...arguments)
}

export function write (fildes, buf, nbyte) {
  return syscall('write', ...arguments)
}

export function getpid () {
  return syscall('getpid', ...arguments)
}

export function getuid () {
  return syscall('getuid', ...arguments)
}

export function getgid () {
  return syscall('getgid', ...arguments)
}

export function setuid (uid) {
  return syscall('setuid', ...arguments)
}

export function setgid (gid) {
  return syscall('setgid', ...arguments)
}

export function getcwd () {
  return syscall('getcwd', ...arguments)
}

export function chdir (path) {
  return syscall('chdir', ...arguments)
}

export function fork () {
  return syscall('fork', ...arguments)
}

export function execv (pathname, argv = []) {
  return syscall('execv', ...arguments)
}

export function execve (path, argv = [], env) {
  if (env) environ = Object.assign({}, env)

  return execv(path, argv)
}

export function execvp (pathname, argv = []) {
  return syscall('execvp', ...arguments)
}

export function execl (path, ...args) {
  return execv(path, args)
}

export function execle (path, ...args) {
  let env = args.pop()

  return execve(path, args, env)
}

export function pipe () {
  throw 'Not implemented'
}

export function dup (fildes) {
  return syscall('dup', arguments)
}

export function dup2 (fildes, fildes2) {
  return syscall('dup2', arguments)
}
