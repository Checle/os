import * as libc from '../../lib/libc.js'

function createFunction (fn) {
  return function (...args) {
    let callback = args.pop()

    fn(...args).then(result => callback(undefined, result), error => callback(error))
  }
}

export var access = createFunction(libc.access)
export var chmod = createFunction(libc.chmod)
export var chown = createFunction(libc.chown)
export var close = createFunction(libc.close)
export var fchmod = createFunction(libc.fchmod)
export var fchown = createFunction(libc.fchown)
export var fdatasync = createFunction(libc.fdatasync)
export var fstat = createFunction(libc.fstat)
export var fsync = createFunction(libc.fsync)
export var ftruncate = createFunction(libc.ftruncate)
export var lchmod = createFunction(libc.lchmod)
export var lchown = createFunction(libc.lchown)
export var link = createFunction(libc.link)
export var lstat = createFunction(libc.lstat)
export var mkdir = createFunction(libc.mkdir)
export var open = createFunction(libc.open)
export var readdir = createFunction(libc.readdir)
export var readlink = createFunction(libc.readlink)
export var realpath = createFunction(libc.realpath)
export var rename = createFunction(libc.rename)
export var rmdir = createFunction(libc.rmdir)
export var stat = createFunction(libc.stat)
export var symlink = createFunction(libc.symlink)
export var truncate = createFunction(libc.truncate)
export var unlink = createFunction(libc.unlink)
export var write = createFunction(libc.write)

export var read = createFunction(async function read (fd, buffer, offset, length, position) {
  await libc.lseek(fd, position)

  if (offset) buffer = buffer.slice(offset)

  return await libc.read(fildes, buffer, length)
})
