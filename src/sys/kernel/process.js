import Namespace from './namespace.js'
import {SystemError} from './errors.js'
import {IDMap} from '../utils/pool.js'
import {Zone} from '@checle/zones'

const SYSCALL = Symbol('SYSCALL')

export default class Process extends Zone {
  api
  cwd
  encoding
  env
  files
  gid
  id
  namespace
  path
  result
  rootpath
  uid

  actions = []
  arguments = null
  loader = null
  realm = null

  constructor (parent) {
    super('process')

    if (parent) {
      this.namespace = parent.namespace
      this.id = this.namespace.processes.add(this)
      this.uid = parent.uid
      this.gid = parent.gid
      this.files = new IDMap(parent.files)
      this.env = Object.assign({}, parent.env)
      this.rootpath = parent.rootpath
    } else {
      this.namespace = new Namespace()
      this.files = new IDMap()
      this.id = 0
      this.uid = 0
      this.gid = 0
      this.env = {}
      this.rootpath = ''
    }

    this.process = this
    this.parent = parent
    this.api = Object.create(this.namespace.api)
    this.encoding = this.namespace.encoding
  }

  terminate (status) {
    this.cancel()

    this.namespace.processes.delete(this.id)
  }

  enter (target) {
    super.enter(target)

    if (target instanceof Process) {
      zone[SYSCALL] = global.syscall
      global.syscall = syscall
    } else if (SYSCALL in target) {
      global.syscall = target[SYSCALL]
    }
  }

  async syscall (id, ...args) {
    let api = this.api
    let target = api[id]

    if (typeof target !== 'function') {
      throw new SystemError('ENOTSUP')
    }

    return target.apply(api, args)
  }
}

export function syscall () {
  return zone.process.syscall(...arguments)
}
