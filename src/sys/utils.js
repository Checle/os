export function isWorker () {
  return typeof 'WorkerGlobalScope' !== 'undefined' && self instanceof self.WorkerGlobalScope
}

/**
 * Via binary search, determine the position in a sorted array where the new
 * value should be inserted via splice.
 */
export function sortedIndexOf (array, value) {
  let low = 0
  let high = array.length

  while (low < high) {
    let mid = (low + high) >>> 1

    if (array[mid] < value) low = mid + 1
    else high = mid
  }
  return low
}

export function normalize (filename, parentname) {
  if (filename === '') return ''

  filename = parentname + filename

  let input = parentname.split('/').concat(filename.split('/'))
  let output = []
  let absolute = filename[0] === '/'

  if (absolute) input.shift()
  if (!input[input.length - 1]) input.pop()

  for (let name of input) {
    if (!name) output = []
    else if (name === '..') output.pop()
    else if (name !== '.') output.push(name)
  }

  filename = output.join('/')

  if (absolute) filename = '/' + filename

  return filename
}

export var hasOwnProperty = Function.prototype.call.bind(Object.prototype.hasOwnProperty)


/*
function normalize (filename, parentname) {
  filename = Process.current.cwd + filename

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