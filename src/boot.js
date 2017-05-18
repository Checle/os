import {setenv, uselib, execl} from './lib/libc.js'

async function main () {
  await setenv('PATH', '/bin', '/usr/bin')
  await setenv('IMPORTPATH', '/lib/web:/lib/c:/lib/node:/lib')

  clone(() => execl('/bin/systemd'))
}

export default main()
