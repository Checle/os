// http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/libgen.h.html

export function dirname (path) {
  return path.replace(/[^/]+$/, '')
}

export function basename (path) {
  let i = path.lastIndexOf('/')

  if (i === -1) return path

  return path.substr(i + 1)
}
