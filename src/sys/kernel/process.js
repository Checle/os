import {syscall} from './api.js'
import Namespace from './namespace.js'
import {IDMap} from '../utils/pool.js'
import {Zone} from 'web-zones'

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
  root
  uid

  actions = []
  arguments = null
  realm = null
  system = null

  constructor (parent) {
    super()

    if (parent) {
      this.namespace = parent.namespace
      this.id = this.namespace.processes.add(this)
      this.uid = parent.uid
      this.gid = parent.gid
      this.files = new IDMap(parent.files)
      this.env = Object.assign({}, parent.env)
      this.root = parent.root
      this.cwd = parent.cwd
    } else {
      this.namespace = new Namespace()
      this.files = new IDMap()
      this.id = 0
      this.uid = 0
      this.gid = 0
      this.env = {}
      this.root = ''
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

  spawn () {
    return this.appendChild(new Process(this))
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

  onfinish () {
    if (!this.parentNode) return

    // Adopt children by parent process
    for (let child of this.childNodes) {
      this.parentNode.appendChild(child)
    }
  }
}
