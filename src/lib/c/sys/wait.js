// http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/sys/wait.h.html

export function waitpid (pid, options) {
  return syscall('waitpid', ...arguments)
}
