import './node/polyfills.js'
import * as path from 'path'
import * as mountLib from '../lib/vfs/mount.js'
import Process from '../sys/kernel/process.js'
import vfs from './node/vfs.js'
import {mount, uselib} from '../lib/libc.js'

async function main () {
  process.on('unhandledRejection', (reason, promise) => { throw reason })

  let current = new Process()
  let api = current.api

  Process.current = current

  Object.assign(current, {
    cwd: process.cwd(),
    env: Object.assign({}, process.env),
    arguments: process.argv.slice(1),
    path: process.execPath,
    scope: global,
  })

  global.syscall = current.syscall.bind(current)

  await uselib(mountLib)
  await mount(vfs, '/')

  //let root = path.dirname(__dirname)

  //api.mount(root, '/usr/local')
  //api.mount('/', root)

  //process.cwd = '/usr/local' + process.cwd
}

export default main()
