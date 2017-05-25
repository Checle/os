import * as fcntl from './fcntl.js'
import * as unistd from './unistd.js'
import {close, unlink} from './unistd.js'

export const BUFSIZ = 1024
export const EOF = Symbol('EOF')
export const TMP_MAX = Number.MAX_VALUE

let tmpcount = 0

let modes = {
  r: fcntl.O_RDONLY,
  w: fcntl.O_WRONLY | fcntl.O_TRUNC | fcntl.O_CREAT,
  a: fcntl.O_APPEND | fcntl.O_TRUNC | fcntl.O_CREAT,
  'r+': fcntl.O_RDWR,
  'w+': fcntl.O_TRUNC | fcntl.O_CREAT | fcntl.O_RDWR,
  'a+': fcntl.O_CREAT | fcntl.O_RDWR | fcntl.O_APPEND,
}

export function eof (stream) {
  return syscall('eof', ...arguments)
}

export function fseek (stream, offset, whence) {
  return unistd.lseek(stream.fd, offset, whence)
}

export function fread (buffer, size, nitems, stream) {
  return unistd.read(stream.fd, buffer, size * nitems)
}

export function fwrite (buffer, size, nitems, stream) {
  return syscall('fwrite', ...arguments)
}

export function rename (old, newp) {
  return syscall('rename', ...arguments)
}

export async function fopen (filename, mode = 'r+') {
  let fd = await fcntl.open(filename, modes[mode])

  return fdopen(fd)
}

export function fdopen (filedes, mode = 'r+') {
  mode = mode.replace('b', '')

  if (!modes.hasOwnProperty(mode)) throw new Error('EINVAL')

  return new File(filedes)
}

export function fclose (stream) {
  return unistd.close(stream.fd)
}

export function fileno (stream) {
  return stream.fd
}

export function tmpnam () {
  if (tmpcount === TMP_MAX) return null

  return [process.pid, ++tmpcount, Date.now()].join('-')
}

export function tempnam (dir, pfx = '') {
  return [dir, '/', pfx, tmpnam()].join('')
}

export async function tmpfile () {
  let pathname = tempnam('/tmp')
  let file = await fopen(pathname, 'w+')

  unlink(pathname)

  return file
}
