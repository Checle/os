import Process from '../process.js'
import {stat} from '../../../lib/libc.js'

export async function access (path, amode) {
  let status = await stat(path)
  let keys = ['uid', 'gid', Symbol()]
  let mode = status.mode

  for (let key of keys) {
    if (status[key] === Process.current[key]) {
      if (mode & amode) return
    }

    mode >>= 8
  }

  throw new Error('EACCES')
}