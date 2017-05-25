import * as path from 'path'

// TODO: Implement through Record FS

/*
export function normalize (filename) {
  let input = filename.split('/')
  let output = []

  if (!input[input.length - 1]) input.pop()

  for (let name of input) {
    if (!name) output = ['']
    else if (name === '..') output.pop()
    else if (name !== '.') output.push(name)
  }

  filename = output.join('/')

  return filename
}

*/
export function resolve (filename, pathname) {
  return path.resolve(pathname, filename)
}

export var normalize = path.normalize
