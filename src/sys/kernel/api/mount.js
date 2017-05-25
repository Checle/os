import Process from '../process.js'
import {SystemError} from '../errors.js'
import {IDMap} from '../../utils/pool.js'
import {BUFSIZ} from '../../../lib/libc.js'
import {resolve} from '../../utils/path.js'
import {sortedIndexOf} from '../../utils.js'

let globalFDs = new IDMap()

async function callTargetFunction (name, filename, ...args) {
  let rootpath = zone.process.rootpath
  let mounts = zone.process.namespace.mounts

  filename = rootpath + resolve(filename, zone.process.cwd)

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
export var read = callFileFunction.bind(undefined, 'read')
export var write = callFileFunction.bind(undefined, 'write')

async function pointFor(path) {
  if (path === '/') return ''

  path = zone.process.rootpath + await realpath(path)

  if (path === '/') return ''

  return path
}

export async function mount (target, path) {
  if (zone.process.uid !== 0) throw new SystemError('EPERM')

  let mounts = zone.process.namespace.mounts
  let point = await pointFor(path)

  if (mounts.has(point)) throw new SystemError('EBUSY')

  mounts.set(point, target)
}

export async function unmount (path) {
  if (zone.process.uid !== 0) throw new SystemError('EPERM')

  let mounts = zone.process.namespace.mounts
  let point = await pointFor(path)

  if (!mounts.delete(point)) throw new SystemError('EINVAL')
}
