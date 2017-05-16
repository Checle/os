export function exit (status) {
  return syscall('exit', ...arguments)
}

export function getenv (name) {
  return syscall('getenv', ...arguments)
}

export function realpath (fileName) {
  return syscall('realpath', ...arguments)
}
