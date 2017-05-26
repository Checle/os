// https://w3c.github.io/workers/

import {Console} from './console.js'

export class WorkerLocation {
  constructor (href) {
    let url = new URL(href, location.href)
    let descriptors = {}

    for (let name of ['href', 'origin', 'protocol', 'host', 'hostname', 'port', 'pathname', 'search', 'hash']) {
      descriptors[name] = {value: url[name]}
    }

    Object.defineProperties(this, descriptors)
  }
}

export class WindowOrWorkerGlobalScope {
  setTimeout (handler, timeout = 0, ...args) {
    let promise = new Promise((resolve, reject) => {
      let callback = (...args) => {
        handler(...args)
      }

      let id = setTimeout(callback, timeout, ...args)
      let cancel = () => clearTimeout(id)

      return zone.add(promise, cancel, 'timer')
    })
  }

  clearTimeout (handle = 0) {
    zone.cancel(handle, 'timer')
  }

  setInterval (handler, timeout = 0, ...args) {
    let promise = new Promise((resolve, reject) => {
      let id = setInterval((...args) => zone.delete(promise) && handler(...args), timeout, ...args)
      let cancel = () => clearInterval(id)

      return zone.add(promise, cancel, 'timer')
    })
  }

  clearInterval (handle = 0) {
    zone.cancel(handle, 'timer')
  }
}

export class WorkerGlobalScope {
  console
  location
  self

  constructor (href) {
    Object.defineProperties(this, {
      self: {value: this},
      location: {value: new WorkerLocation(href)},
      console: {value: new Console()},
    })
  }
}

Object.assign(WorkerGlobalScope.prototype, WindowOrWorkerGlobalScope.prototype)
