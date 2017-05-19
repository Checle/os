import './browser/polyfills.js'
import './system.js'
import Process from '../sys/kernel/process.js'
import init from './init.js'
import {dirname} from '../lib/libc.js'

async function main () {
  let path = decodeURI(location.pathname)
  let cwd = dirname(path)
  let process = Process.current
  let api = process.api

  Object.assign(process, {
    cwd,
    path,
    scope: self,
  })

  self.syscall = process.syscall.bind(process)

  await init()
}

main()
