export function branch (path1, path2) {
  return syscall('branch', ...arguments)
}

export function mount (source, target) {
  return syscall('mount', ...arguments)
}

export function unmount (source, target) {
  return syscall('unmount', ...arguments)
}

export async function uselib (library) {
  return syscall('uselib', library)
}

export function clone (fn, childStack, flags, ...args) {
  return syscall('clone', ...arguments)
}

export function chroot (path) {
  return syscall('chroot', ...arguments)
}
