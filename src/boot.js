import {setenv, uselib, execl} from './lib/libc'

async function main () {
  if (typeof require !== 'undefined' && typeof process !== 'undefined') {
    require('./boot/node.js')
  }

  await setenv('PATH', '/bin', '/usr/bin')
  await setenv('IMPORTPATH', '/lib/web:/lib/c:/lib/node:/lib')

  clone(() => execl('/bin/systemd'))
}

main()
