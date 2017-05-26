// http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/sys/stat.h.html

export const D_PERSISTENT = 1
export const D_TEMPORARY = 2
export const D_RECORD = 3
export const S_IFBLK = (1 << 32) << 1
export const S_IFCHR = (1 << 32) << 2
export const S_IFIFO = (1 << 32) << 3
export const S_IFREG = (1 << 32) << 4
export const S_IFDIR = (1 << 32) << 5
export const S_IFLNK = (1 << 32) << 6
export const S_IFSOCK = (1 << 32) << 7
export const S_IRWXU = 0o700
export const S_IRUSR = 0o400
export const S_IWUSR = 0o200
export const S_IXUSR = 0o100
export const S_IRWXG = 0o70
export const S_IRGRP = 0o40
export const S_IWGRP = 0o20
export const S_IXGRP = 0o10
export const S_IRWXO = 0o7
export const S_IROTH = 0o4
export const S_IWOTH = 0o2
export const S_IXOTH = 0o1
export const S_ISUID = 0o4000
export const S_ISGID = 0o2000
export const S_ISVTX = 0o1000

export function chmod (path, mode) {
  return syscall('chmod', ...arguments)
}

export function fchmod (fildes, mode) {
  return syscall('fchmod', ...arguments)
}

export function fstat (fildes) {
  return syscall('fstat', ...arguments)
}

export function lstat (path) {
  return syscall('lstat', ...arguments)
}

export function mkdir (path, mode) {
  return syscall('mkdir', ...arguments)
}

export function mknod (path, mode) {
  return syscall('mknod', ...arguments)
}

export function mkfifo (path, mode, dev) {
  return syscall('mkfifo', ...arguments)
}

export function stat (path) {
  return syscall('stat', ...arguments)
}
