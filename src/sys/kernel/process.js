import * as path from 'path'
import Namespace from './namespace.js'
import {IDMap} from '../utils/pool.js'
import {Zone} from '@record/zone'

export default class Process extends Zone {
  static current = new Process()

  cwd
  path
  api
  files
  result
  env

  arguments = null
  scope = null
  actions = []

  constructor (parent) {
    super()

    if (parent) {
      this.namespace = parent.namespace
      this.id = this.namespace.processes.add(this)
      this.uid = parent.uid
      this.gid = parent.gid
      this.files = new IDMap(parent.files)
      this.env = Object.assign({}, parent.env)
    } else {
      this.namespace = new Namespace()
      this.files = new IDMap()
      this.uid = 0
      this.gid = 0
      this.env = {}
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
      let result = super.run(...arguments)

      this.result = result

      return result
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
