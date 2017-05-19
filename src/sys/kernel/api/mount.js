import Process from '../process.js'
import {SystemError} from '../errors.js'
import {IDMap} from '../../utils/pool.js'
import {basename, dirname, BUFSIZ} from '../../../lib/libc.js'
import {resolve} from '../path.js'
import {sortedIndexOf} from '../../utils.js'

let points = []
let mounts = {}
let globalFDs = new IDMap()

async function callTargetFunction (name, filename, ...args) {
  let root = Process.current.root

  filename = root + resolve(filename, Process.current.cwd)

  let index = sortedIndexOf(points, filename)

  if (points.length > index && filename === points[index]) {
    return filename
  }

  if (index > 0) {
    let point = points[index - 1]

    if (filename.substr(0, point.length) === point && filename[point.length] === '/') {
      let target = mounts[point]
      let path = filename.substr(point.length)

      if (typeof target[name] !== 'function') throw new SystemError('ENOTSUP')

      let result = await target[name](path, ...args)

      if (typeof result === 'string') {
        // Return value is a filename
        if (result.substr(0, root.length) === root && result[root.length] === '/') {
          return result.substr(root.length)
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

  return target[name].call(this, fd, ...args)
}

async function callCloseFunction (name, globalFD, ...args) {
  let result = await callFileFunction(...arguments)

  if (!globalFDs.delete(globalFD)) throw new SystemError('EBADF')

  return result
}

export var chmod = callTargetFunction.bind(undefined, 'chmod')
export var chown = callTargetFunction.bind(undefined, 'chown')
export var close = callCloseFunction.bind(undefined, 'close')
export var creat = callTargetFunction.bind(undefined, 'creat')
export var link = callTargetFunction.bind(undefined, 'link')
export var lstat = callTargetFunction.bind(undefined, 'lstat')
export var mknod = callTargetFunction.bind(undefined, 'mknod')
export var open = callTargetFunction.bind(undefined, 'open')
export var realpath = callTargetFunction.bind(undefined, 'realpath')
export var rename = callTargetFunction.bind(undefined, 'rename')
export var stat = callTargetFunction.bind(undefined, 'stat')
export var unlink = callTargetFunction.bind(undefined, 'unlink')
export var write = callFileFunction.bind(undefined, 'write')

export async function read (fildes, buf, nbyte) {
  if (buf != null) {
    return callFileFunction('read', fildes, buf, nbyte == null ? buf.length : nbyte)
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

async function pointFor(path) {
  if (path === '/') return ''

  path = Process.current.root + await realpath(path)

  if (path === '/') return ''

  return path
}

export async function mount (target, path) {
  if (Process.current.uid !== 0) throw new SystemError('EPERM')

  let point = await pointFor(path)

  if (mounts.hasOwnProperty(point)) throw new SystemError('EBUSY')

  points.splice(sortedIndexOf(points, point), 0, point)

  mounts[point] = target
}

export async function unmount (path) {
  if (Process.current.uid !== 0) throw new SystemError('EPERM')

  let point = await pointFor(path)

  if (!mounts.hasOwnProperty(point)) throw new SystemError('EINVAL')

  delete mounts[point]

  points.splice(sortedIndexOf(points, point), 1)
}
