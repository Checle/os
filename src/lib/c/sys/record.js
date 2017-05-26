export function branch (path1, path2) {
  return syscall('branch', path1, path2)
}

export function mount (source, target) {
  return syscall('mount', source, target)
}

export function unmount (source, target) {
  return syscall('unmount', source, target)
}

export async function uselib (library) {
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
