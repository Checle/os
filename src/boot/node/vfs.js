import * as fs from 'fs'
import {spawn} from 'child_process'

let vfs = {
  read (filedes, buf, nbytes) {
    if (!buf) {
      let buffers = []
      let nbytes

      do {
        let buf = new Buffer(BUFSIZ)

        nbytes = read(filedes, buf)
        buffers.push(buf.slice(0, nbytes))
      } while (nbytes)
    }

    return read(filedes, buf, 0, nbytes, null)
  },

  branch (source, target) {
    return new Promise((resolve, reject) => {
      let child = spawn('cp', ['-R', source, target])

      child.on('close', code => code ? reject() : resolve())
      child.on('error', error => reject())
    })
  },
}

function createFunction (async, sync) {
  return function (...args) {
    let promise

    return {
      then: (resolve, reject) => {
        if (!promise) {
          promise = new Promise((resolve, reject) => {
            let callback = (error, value) => {
              if (error == null) resolve(value)
              else reject(error)
            }
            async.apply(null, args.concat(callback))
          })
        }

        return promise.then(resolve, reject)
      },
      valueOf: () => {
        if (promise) return this

        return sync.apply(null, args)
      }
    }
  }
}

const names = ['access', 'chmod', 'chown', 'close', 'fchmod', 'fchown',
  'fdatasync', 'fstat', 'fsync', 'ftruncate', 'lchmod', 'lchown', 'link',
  'lstat', 'mkdir', 'open', 'readdir', 'readlink', 'realpath', 'read',
  'rename', 'rmdir', 'stat', 'symlink', 'truncate', 'unlink', 'write']

for (let name of names) {
  vfs[name] = createFunction(fs[name], fs[name + 'Sync'])
}

export default vfs
