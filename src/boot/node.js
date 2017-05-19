import './node/polyfills.js'
import * as System from 'systemjs'
import * as path from 'path'
import Loader from './node/loader'
import createSystem from '../sys/kernel/system.js'
import Process from '../sys/kernel/process.js'
import vfs from './node/vfs.js'
import {URL} from '../lib/libweb.js'
import {chroot, open, read, mount, unmount} from '../lib/libc.js'

async function main () {
  process.on('unhandledRejection', (reason, promise) => { throw reason })

  let currentProcess = Process.current
  let api = currentProcess.api
  let root = path.dirname(__dirname)
  let System = createSystem(new Loader())

  Object.assign(currentProcess, {
    cwd: process.cwd(),
    env: Object.assign({}, process.env),
    arguments: process.argv.slice(1),
    path: process.execPath,
    scope: global,
  })

  // Set up pseudo-process for basic APIs such as `fetch()`
  global.syscall = currentProcess.syscall.bind(currentProcess)
  global.location = new URL('file://' + encodeURI(currentProcess.cwd))
  global.System = System

  await mount(vfs, '/')
  //await mount(path.resolve(root, '../node_modules'), path.join(root, 'usr/lib'))
  await chroot(root)
  await mount(vfs, '/usr/local')

  // Load Record FS driver
  // On init: if DB non-existing, bootstrap - copy root folder recursively

  currentProcess.cwd = '/usr/local' + Process.current.cwd

  let init = (await System.import('/boot/init.js')).default

  init()
}

export default main()
