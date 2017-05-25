import * as fs from 'fs'
import {spawn} from 'child_process'

export default class VFS {
  constructor () {
    function createFunction (name, transformArgs) {
      let async = fs[name]

      return function (...args) {
        return new Promise((resolve, reject) => {
            let callback = (error, value) => {
            if (error == null) resolve(value)
            else reject(error)
          }

          if (transformArgs) args = transformArgs(...args)

          async(...args, callback)
        })
      }
    }

    let names = ['access', 'chmod', 'chown', 'close', 'fchmod', 'fchown',
      'fdatasync', 'fstat', 'fsync', 'ftruncate', 'lchmod', 'lchown', 'link',
      'lstat', 'mkdir', 'readdir', 'readlink', 'realpath',
      'rename', 'rmdir', 'stat', 'symlink', 'truncate', 'unlink', 'write']

    for (let name of names) {
      this[name] = createFunction(name)
    }

    this.open = createFunction('open', (path, oflag, ...args) => [path, oflag == null ? 'r' : oflag, ...args])
    this.read = createFunction('read', (fildes, buf, nbyte) => [fildes, buf, 0, nbyte, null])
  }

  read (fildes, buf, nbyte) {
    if (!buf) {
      let buffers = []
      let nbyte

      do {
        let buf = new Buffer(BUFSIZ)

        nbyte = read(fildes, buf)
        buffers.push(buf.slice(0, nbyte))
      } while (nbyte)
    }

    return read(fildes, buf, 0, nbyte, null)
  }

  branch (source, target) {
    return new Promise((resolve, reject) => {
      let child = spawn('cp', ['-R', source, target])

      child.on('close', code => code ? reject() : resolve())
      child.on('error', error => reject())
    })
  }
}
