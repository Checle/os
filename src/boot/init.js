import {clone, execl, setenv, getcwd} from '../lib/libc.js'

export default async function main () {
  await setenv('PATH', '/bin', '/usr/bin')
  await setenv('IMPORTPATH', '/lib/web:/lib/c:/lib/node:/lib:/usr/lib:/usr/lib/node')

  // await clone(() => execl('/bin/systemd'))
  System.import('/bin/record')
}
