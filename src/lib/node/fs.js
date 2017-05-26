import * as api from '../../lib/libc.js'

function createFunction (fn) {
  return function (...args) {
    let callback = args.pop()

    fn(...args).then(result => callback(undefined, result), error => callback(error))
  }
}

export var access = createFunction(api.access)
export var chmod = createFunction(api.chmod)
export var chown = createFunction(api.chown)
export var close = createFunction(api.close)
export var fchmod = createFunction(api.fchmod)
export var fchown = createFunction(api.fchown)
export var fdatasync = createFunction(api.fdatasync)
export var fstat = createFunction(api.fstat)
export var fsync = createFunction(api.fsync)
export var ftruncate = createFunction(api.ftruncate)
export var lchmod = createFunction(api.lchmod)
export var lchown = createFunction(api.lchown)
export var link = createFunction(api.link)
export var lstat = createFunction(api.lstat)
export var mkdir = createFunction(api.mkdir)
export var open = createFunction(api.open)
export var readdir = createFunction(api.readdir)
export var readlink = createFunction(api.readlink)
export var realpath = createFunction(api.realpath)
export var rename = createFunction(api.rename)
export var rmdir = createFunction(api.rmdir)
export var stat = createFunction(api.stat)
export var symlink = createFunction(api.symlink)
export var truncate = createFunction(api.truncate)
export var unlink = createFunction(api.unlink)
export var write = createFunction(api.write)

export var read = createFunction(async function read (fd, buffer, offset, length, position) {
  await api.lseek(fd, position)

  if (offset) buffer = buffer.slice(offset)

  return await api.read(fildes, buffer, length)
})
