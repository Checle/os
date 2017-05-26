import * as fs from 'fs'
import {spawn} from 'child_process'
import {SEEK_CUR, SEEK_END, SEEK_SET} from '../../lib/libc.js'

const FILES = Symbol('FILES')

let vfs = {}

function createFunction (fn, transformArgs) {
  return function (subject, ...args) {
    return new Promise((resolve, reject) => {
      let callback = (error, value) => {
        if (error != null) return reject(error)
        else resolve(value)
      }

      fn(subject, ...args, callback)
    })
  }
}

let names = ['access', 'chmod', 'chown', 'close', 'fchmod', 'fchown',
  'fdatasync', 'fstat', 'fsync', 'ftruncate', 'lchmod', 'lchown', 'link',
  'lstat', 'mkdir', 'open', 'read', 'readdir', 'readlink', 'realpath',
  'rename', 'rmdir', 'stat', 'symlink', 'truncate', 'unlink', 'write']

for (let name of names) {
  vfs[name] = createFunction(fs[name])
}

export default class VFS {
  [FILES] = {}

  async open (path, oflag, ...args) {
    let fildes = await vfs.open(path, oflag == null ? 'r' : oflag, ...args)

    this[FILES][fildes] = {position: 0, oflag}

    return fildes
  }

  async read (fildes, buf, nbyte) {
    let file = this[FILES][fildes]

    nbyte = await vfs.read(fildes, buf, 0, nbyte, file && file.position)
    file.position += nbyte

    return nbyte
  }

  async lseek (fildes, offset, whence) {
    let file = this[FILES][fildes]

    if (whence === SEEK_SET) return (file.position = offset)
    if (whence === SEEK_CUR) return (file.position += offset)

    let status = await this.fstat(fildes)

    return (file.position = status.size + offset)
  }

  async close (fildes) {
    await vfs.close(fildes)

    delete this[FILES][fildes]
  }

  branch (source, target) {
    return new Promise((resolve, reject) => {
      let child = spawn('cp', ['-R', source, target])

      child.on('close', code => code ? reject() : resolve())
      child.on('error', error => reject())
    })
  }
}

Object.setPrototypeOf(VFS.prototype, vfs)
