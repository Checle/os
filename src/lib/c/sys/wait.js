export function waitpid (pid, options) {
  return syscall('waitpid', ...arguments)
}
