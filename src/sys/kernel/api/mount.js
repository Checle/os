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

export var chmod = createFunction('chmod')
export var chown = createFunction('chown')
export var lstat = createFunction('lstat')
export var stat = createFunction('stat')
export var mknod = createFunction('mknod')
export var open = createFunction('open')
export var rename = createFunction('rename')
export var link = createFunction('link')
export var unlink = createFunction('unlink')
export var realpath = createFunction('realpath')

export function mount (source, destination) {
  mounts[destination] = source
}
