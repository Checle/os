import './node/polyfills.js'
import * as path from 'path'
import Process from '../sys/kernel/process.js'
import vfs from './node/vfs.js'
import {uselib} from 'unistd.js'
import {getenv, setenv} from 'stdlib.js'

async function main () {
  process.on('unhandledRejection', (reason, promise) => { throw reason })

  let currentProcess = Process.current
  let api = currentProcess.api

  Object.assign(currentProcess, {
    cwd: process.cwd(),
    env: Object.assign({}, process.env),
    arguments: process.argv.slice(1),
    path: process.execPath,
    scope: global,
  })

  global.syscall = currentProcess.syscall.bind(currentProcess)

  await uselib(vfs)

  let root = path.dirname(__dirname)

  await setenv('PATH', ['/bin', '/usr/bin'].map(path => root + path).join(':'))
  await setenv('IMPORTPATH', ['/lib/c', '/lib/node'].map(path => root + path).join(':'))

  //api.mount(root, '/usr/local')
  //api.mount('/', root)

  //process.cwd = '/usr/local' + process.cwd

  return process
}

export default main()
