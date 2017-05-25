import Namespace from './namespace.js'
import {SystemError} from './errors.js'
import {IDMap} from '../utils/pool.js'
import {Zone} from '@checle/zones'

const PROCESS = Symbol('PROCESS')
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
  status
  rootpath
  uid

  actions = []
  arguments = null
  loader = null
  realm = null

  constructor (parent) {
    super()

    if (parent) {
      this.namespace = parent.namespace
      this.id = this.namespace.processes.add(this)
      this.uid = parent.uid
      this.gid = parent.gid
      this.files = new IDMap(parent.files)
      this.env = Object.assign({}, parent.env)
      this.rootpath = parent.rootpath
      this.cwd = parent.cwd
    } else {
      this.namespace = new Namespace()
      this.files = new IDMap()
      this.id = 0
      this.uid = 0
      this.gid = 0
      this.env = {}
      this.rootpath = ''
      this.cwd = ''
    }

    this.name = '<process ' + this.id + '>'
    this.parent = parent
    this.api = Object.create(this.namespace.api)
    this.encoding = this.namespace.encoding
  }

  terminate (status) {
    this.cancel()

    this.namespace.processes.delete(this.id)
  }

  async syscall (id, ...args) {
    let api = this.api
    let target = api[id]

    if (typeof target !== 'function') {
      throw new SystemError('ENOTSUP')
    }

    return target.apply(api, args)
  }

  onenter () {
    zone[PROCESS] = Process.current
    zone[SYSCALL] = global.syscall
    Process.current = this
    global.syscall = syscall
  }

  onleave () {
    Process.current = zone[PROCESS]
    global.syscall = zone[SYSCALL]
    delete zone[PROCESS]
    delete zone[SYSCALL]
  }

  async import (key) {
    if (key.indexOf(':') === -1 && key[0] !== '.' && key[0] !== '/') {
      let filename = decodeURI(key)

      filename = await resolve(filename, this.env.IMPORTPATH)

      // Encodes special chars such as '#'
      return 'file://' + encodeURIComponent(filename.substr(rootpath.length)).replace(/%2F/, '/')
    }

    // Otherwise, key is a valid URL input
    key = new URL(key, 'file://' + location.href).href

    if (this.loader != null) {
      let resolvedKey = await this.loader.resolve(key, this.href)

      if (resolvedKey) return this.loader.import(resolvedKey)
    }

    return this.namespace.loader.import(key)
  }
}

export function syscall () {
  return Process.current.syscall(...arguments)
}
