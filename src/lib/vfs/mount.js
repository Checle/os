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

export const chmod = call.bind('chmod')
export const chown = call.bind('chown')
export const lstat = call.bind('lstat')
export const stat = call.bind('stat')
export const mknod = call.bind('mknod')
export const open = call.bind('open')
export const rename = call.bind('rename')
export const link = call.bind('link')
export const unlink = call.bind('unlink')

export function mount (source, destination) {
  mounts[source] = destination
}
