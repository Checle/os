import Process from '../sys/kernel/process.js'

let path = location.href.substr(0, location.href.length - location.hash.length)

if (location.protocol === 'file:') {
  path = decodeURIComponent(location.pathname)
}

let cwd = path.replace(/\/[^/]*$/, '')
let process = Process.current
let api = process.api

Object.assign(process, {
  cwd,
  path,
  scope: self,
})

self.syscall = process.syscall.bind(process)
