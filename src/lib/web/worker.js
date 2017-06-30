// https://w3c.github.io/workers/

import {Console} from './console.js'
import {clearInterval, clearTimeout, setInterval, setTimeout} from 'web-zones'

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
  clearInterval = clearInterval
  clearTimeout = clearTimeout
  setInterval = setInterval
  setTimeout = setTimeout
}

export class WorkerGlobalScope {
  console
  location
  self

  constructor (href) {
    Object.defineProperties(this, {
      self: {value: this, enumerable: true},
      location: {value: new WorkerLocation(href), enumerable: true},
      console: {value: new Console(), enumerable: true},
    })
  }
}

Object.assign(WorkerGlobalScope.prototype, WindowOrWorkerGlobalScope.prototype)
