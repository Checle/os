import Process from '../process.js'
import {SystemError} from '../errors.js'
import {IDMap} from '../../utils/pool.js'
import {BUFSIZ} from '../../../lib/libc.js'
import {resolve} from '../../utils/path.js'
import {sortedIndexOf} from '../../utils.js'

let globalFDs = new IDMap()

async function callTargetFunction (name, filename, ...args) {
  let rootpath = this.process.root
  let mounts = this.process.namespace.mounts

  filename = rootpath + resolve(filename, this.process.cwd)

  let index = mounts.indexOf(filename)

  if (mounts.length > index && filename === mounts[index]) {
    return filename
  }

  if (index > 0) {
    let point = mounts[index - 1]

    if (filename.substr(0, point.length) === point && filename[point.length] === '/') {
      let target = mounts.get(point)
      let path = filename.substr(point.length)

      if (typeof target[name] !== 'function') throw new SystemError('ENOTSUP')

      let result = await target[name](path, ...args)

      if (typeof result === 'string') {
        // Return value is a filename
        if (result.substr(0, rootpath.length) === rootpath && result[rootpath.length] === '/') {
          return result.substr(rootpath.length)
        } else {
          throw new SystemError('EACCES')
        }
      } else if (typeof result === 'number') {
        // Return value is a file descriptor
        let globalFD = globalFDs.add({fd: result, target})

        return globalFD
      } else {
        return result
      }
    }
  }

  throw new SystemError('ENOENT')
}

async function callFileFunction (name, globalFD, ...args) {
  if (!globalFDs.has(globalFD)) throw new SystemError('EBADF')

  let {fd, target} = globalFDs.get(globalFD)

  if (typeof target[name] !== 'function') throw new SystemError('ENOTSUP')

  return target[name](fd, ...args)
}

async function callCloseFunction (name, globalFD, ...args) {
  let result = await callFileFunction.apply(this, arguments)

  if (!globalFDs.delete(globalFD)) throw new SystemError('EBADF')

  return result
}

export function chmod () {
  return callTargetFunction.call(this, 'chmod', ...arguments)
}

export function chown () {
  return callTargetFunction.call(this, 'chown', ...arguments)
}

export function close () {
  return callCloseFunction.call(this, 'close', ...arguments)
}

export function creat () {
  return callTargetFunction.call(this, 'creat', ...arguments)
}

export function link () {
  return callTargetFunction.call(this, 'link', ...arguments)
}

export function lseek () {
  return callFileFunction.call(this, 'lseek', ...arguments)
}

export function lstat () {
  return callTargetFunction.call(this, 'lstat', ...arguments)
}

export function mknod () {
  return callTargetFunction.call(this, 'mknod', ...arguments)
}

export function open () {
  return callTargetFunction.call(this, 'open', ...arguments)
}

export function realpath () {
  return callTargetFunction.call(this, 'realpath', ...arguments)
}

export function rename () {
  return callTargetFunction.call(this, 'rename', ...arguments)
}

export function stat () {
  return callTargetFunction.call(this, 'stat', ...arguments)
}

export function unlink () {
  return callTargetFunction.call(this, 'unlink', ...arguments)
}

export async function read (fildes, res, nbyte) {
  if (res === undefined) res = this.getenc()

  if (res !== null && typeof res !== 'string') {
    return callFileFunction.call(this, 'read', fildes, res, nbyte == null ? res.length : nbyte)
  }

  let buffers = []
  let length = 0

  do {
    let buffer = new Uint8Array(nbyte == null ? BUFSIZ : Math.min(BUFSIZ, nbyte - length))
    let n = await this.read(fildes, buffer)

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

export function write () {
  return callFileFunction.call(this, 'write', ...arguments)
}


async function pointFor(path) {
  if (path === '/') return ''

  path = this.process.root + await realpath(path)

  if (path === '/') return ''

  return path
}

export async function mount (target, path) {
  if (this.process.uid !== 0) throw new SystemError('EPERM')

  let mounts = this.process.namespace.mounts
  let point = await pointFor(path)

  if (mounts.has(point)) throw new SystemError('EBUSY')

  mounts.set(point, target)
}

export async function unmount (path) {
  if (this.process.uid !== 0) throw new SystemError('EPERM')

  let mounts = this.process.namespace.mounts
  let point = await pointFor(path)

  if (!mounts.delete(point)) throw new SystemError('EINVAL')
}
