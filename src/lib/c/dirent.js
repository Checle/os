// http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/unistd.h.html

export function opendir (dirname) {
  return syscall('opendir', ...arguments)
}

export function readdir (dirp) {
  let result = dirp.next()
  return result.done ? null : result.value
}

export function closedir (dirp) { }
