import Process from '../sys/kernel/process.js'

export default async function init (options) {
  let api = Process.current.api

  await api.setenv('PATH', '/bin', '/usr/bin')
  await api.setenv('IMPORTPATH', '/lib/web:/lib/c:/lib/node:/lib:/usr/lib:/usr/lib/node')

  api.clone(() => api.execv('/bin/systemd'))
}
