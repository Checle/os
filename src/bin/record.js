import * as program from 'commander'
import pkg from '../../package.json'
import {ArgumentParser} from 'argparse'
import {clone, execv, waitpid} from '../lib/libc.js'

let {version, description} = pkg

let parser = new ArgumentParser({
  version,
  description,
  addHelp: true,
})

parser.addArgument('command', {metavar: 'command', nargs: '?', help: 'command to execute', defaultValue: 'sh'})
parser.addArgument('args', {metavar: 'argument', nargs: '*', help: 'command arguments'})

async function main () {
  let {command, args} = parser.parseArgs()
  let pid = await clone(() => execv(command, args))

  await waitpid(pid)
}

main()
