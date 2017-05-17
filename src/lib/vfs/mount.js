import * as base from '../libc'

let mounts = []

function call (name, filename, ...args) {
  let api = base

  for (let source in mounts) {
    let destination = mounts[source]

    if (filename.substr(0, source.length) !== source) continue

    filename = filename.substr(source.length)

    if (typeof destination === 'string') {
      filename = destination + filename
    } else {
      api = destination
    }
  }

  return api[name].call(this, filename, ...args)
}

export const chmod = call.bind(undefined, 'chmod')
export const chown = call.bind(undefined, 'chown')
export const lstat = call.bind(undefined, 'lstat')
export const stat = call.bind(undefined, 'stat')
export const mknod = call.bind(undefined, 'mknod')
export const open = call.bind(undefined, 'open')
export const rename = call.bind(undefined, 'rename')
export const link = call.bind(undefined, 'link')
export const unlink = call.bind(undefined, 'unlink')

export function mount (source, destination) {
  mounts[source] = destination
}
