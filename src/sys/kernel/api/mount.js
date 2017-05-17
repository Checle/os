import Process from '../process.js'

let mounts = []

function normalize (filename) {
  let cwd = Process.current.cwd

  filename = cwd + '/' + filename
  filename = filename.replace(/^[\s\S]*\/\//, '/')
  filename = filename.replace(/(?:\/[\s\S]*?\/\.\.|\/\.)(?=\/|$)/g, '')

  return filename
}

function createFunction (name) {
  return function (filename, ...args) {
    filename = normalize(filename)

    for (let source in mounts) {
      let destination = mounts[source]

      if (filename.substr(0, source.length) !== source) continue

      filename = filename.substr(source.length)

      if (typeof destination === 'string') {
        filename = destination + filename
      } else if (typeof destination[name] !== 'undefined') {
        return destination[name].call(this, filename, ...args)
      }
    }

    throw new Error('ENOENT')
  }
}

export const chmod = createFunction('chmod')
export const chown = createFunction('chown')
export const lstat = createFunction('lstat')
export const stat = createFunction('stat')
export const mknod = createFunction('mknod')
export const open = createFunction('open')
export const rename = createFunction('rename')
export const link = createFunction('link')
export const unlink = createFunction('unlink')
export const realpath = createFunction('realpath')

export function mount (source, destination) {
  mounts[destination] = source
}
