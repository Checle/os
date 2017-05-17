import * as path from 'path'
import Namespace from './namespace.js'
import {IDMap} from '../utils/pool.js'
import {Zone} from '@record/zone'

export default class Process extends Zone {
  static current = null

  cwd
  path
  api
  files

  arguments = null
  scope = null
  actions = []
  env = {}

  constructor (parent) {
    super()

    if (parent) {
      this.namespace = parent.namespace
      this.id = this.namespace.processes.add(this)
      this.uid = parent.uid
      this.gid = parent.gid
      this.files = new IDMap(parent.files)
    } else {
      this.namespace = new Namespace()
      this.files = new IDMap()
      this.uid = 0
      this.gid = 0
    }

    this.parent = parent
    this.api = Object.create(this.namespace.api)
  }

  terminate (status) {
    this.cancel()

    this.namespace.processes.delete(this.id)
  }

  run () {
    let previous = Process.current

    Process.current = this

    try {
      return super.run(...arguments)
    } finally {
      Process.current = previous
    }
  }

  async syscall (id, ...args) {
    let api = this.api
    let target = api[id]

    if (typeof target !== 'function') {
      throw new Error('ENOTSUP')
    }

    return target.apply(api, args)
  }
}

Process.prototype.namespace = new Namespace()
