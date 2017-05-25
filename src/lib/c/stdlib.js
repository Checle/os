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
