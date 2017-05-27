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
export const GID_RECORD = 15
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
export const UID_RECORD = 15

export function branch (path1, path2) {
  return syscall('branch', path1, path2)
}

export function mount (source, target) {
  return syscall('mount', source, target)
}

export function unmount (source, target) {
  return syscall('unmount', source, target)
}

export function uselib (library) {
  return syscall('uselib', library)
}

export function clone (fn, childStack, flags, ...args) {
  return syscall('clone', fn, childStack, flags, ...args)
}

export function chroot (path) {
  return syscall('chroot', path)
}

export function getenc () {
  return syscall('getenc')
}

export function setenc (encoding) {
  return syscall('setenc', encoding)
}

export function evaluate () {
  return syscall('evaluate')
}

export function resolve (key, parent) {
  return syscall('resolve', key, parent)
}

export function instantiate (key, parent) {
  return syscall('instantiate', key, parent)
}
