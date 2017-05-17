import * as fcntl from '../fcntl'
import * as unistd from '../unistd'
import * as stdio from '../stdio'

export function branch (path1, path2) {
  return syscall('branch', ...arguments)
}

export function mount (source, target) {
  return syscall('mount', ...arguments)
}

export async function uselib (library) {
  return syscall('uselib', library)
}

export function clone (fn, childStack, flags, ...args) {
  return syscall('clone', ...arguments)
}
