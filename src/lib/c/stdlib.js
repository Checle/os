export function exit (status) {
  return syscall('exit', ...arguments)
}

export function getenv (name) {
  return syscall('getenv', ...arguments)
}

export function setenv (envname, envval, overwrite) {
  return syscall('setenv', ...arguments)
}

export function realpath (fileName) {
  return syscall('realpath', ...arguments)
}
