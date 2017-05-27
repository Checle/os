// http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/pwd.h.html

import {BUFSIZ} from './stdio.js'
import {open, read} from '../libc.js'

let lines

export async function getpwent () {
  if (lines == null) {
    let fd, text

    try {
      fd = await open('/etc/passwd')
      text = await read(fd)
    } finally {
      syscall('close', fd)
    }

    lines = text.split(/\r?\n/g).reverse()
  }

  if (!lines.length) return null

  let [name, pwd, uid, gid, title, dir, shell] = lines.pop().split(':')

  return {name, uid: Number(uid), gid: Number(gid), dir, shell}
}

export function setpwent () {
  lines = null
}

export function getpwduid (uid) {
  setpwent()

  const next = () => getpwent().then(passwd => passwd == null || passwd.uid === uid ? passwd : next())

  return next()
}
