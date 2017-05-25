import {BUFSIZ} from './stdio.js'
import {open} from './fcntl.js'
import {read, close} from './unistd.js'

export const GID_ROOT = 0
export const GID_BIN = 1
export const GID_DAEMON = 2
export const GID_ADM = 4
export const GID_LP = 7
export const GID_SYNC = 0
export const GID_SHUTDOWN = 0
export const GID_HALT = 0
export const GID_MAIL = 12
export const GID_NEWS = 13
export const GID_UUCP =  14
export const GID_OPERATOR =  0
export const GID_GAMES =  100
export const GID_GOPHER =  30
export const GID_FTP =  50
export const UID_ROOT = 0
export const UID_BIN = 1
export const UID_DAEMON = 2
export const UID_ADM = 3
export const UID_LP = 4
export const UID_SYNC = 5
export const UID_SHUTDOWN = 6
export const UID_HALT = 7
export const UID_MAIL = 8
export const UID_NEWS = 9
export const UID_UUCP = 10
export const UID_OPERATOR = 11
export const UID_GAMES = 12
export const UID_GOPHER = 13
export const UID_FTP = 14

let lines

export async function getpwent () {
  if (lines == null) {
    let fd = await open('/etc/passwd')
    let text = await read(fd)

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
