import * as fcntl from '../fcntl'
import * as unistd from '../unistd'
import * as stdio from '../stdio'

let requests = {length: 0}

/*
addEventListener('message', (event) => {
  let {id, type, data} = event.data
  let request = requests[id]

  if (type === 'result') request.resolve(data)
  else if (type === 'error') request.reject(data)
  else return

  event.stopImmediatePropagation()
})
*/

function request(type, data) {
  return new Promise((resolve, reject) => {
    let callback = resolve
    let request = {id: (requests.length++ % Number.MAX_VALUE), type, data}

    requests[request.id] = {resolve, reject}

    postMessage(request)
  })
}

async function respond(id, type, data) {
  try {
    data = await data
    postMessage({id, type: 'result', data})
  } catch (error) {
    postMessage({id, type: 'error', error})
  }
}

export async function syscall (id, ...args) {
  return request('syscall', arguments)
}

export function branch (path1, path2) {
  return
}

export async function uselib (library) {
  library = await System.resolve(library)

  return syscall('uselib', library)
}

export function clone (fn, childStack, flags, arg) {
  return syscall('clone', fn, childStack, flags, arg)
}
