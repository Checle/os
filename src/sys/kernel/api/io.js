import Process from '../process.js'
import {R_OK} from '../../../lib/libc.js'

export async function access (path, amode = R_OK) {
  let status = await this.stat(path)
  let keys = ['uid', 'gid', Symbol()]
  let mode = status.mode

  for (let key of keys) {
    if (status[key] === this[key]) {
      if (mode & amode) return
    }

    mode >>= 3
  }

  throw new Error('EACCES')
}
