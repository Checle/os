// http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/stdlib.h.html

import {CLD_EXITED} from '../../lib/libc.js'

export {getenc, setenc} from './sys/record.js'

export function exit (status) {
  return syscall('exit', status)
}

export function getenv (name) {
  return syscall('getenv', name)
}

export function setenv (envname, envval, overwrite) {
  return syscall('setenv', envname, envval, overwrite)
}

export function realpath (fileName) {
  return syscall('realpath', fileName)
}

export function mkstemp (template) {
  return syscall('mkstemp', template)
}

export function WIFEXITED (status) {
  return status.siCode === CLD_EXITED
}

export function WEXITSTATUS (status) {
  return status.siStatus
}
