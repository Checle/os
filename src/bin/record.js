import {ArgumentParser} from 'argparse'
import {clone, execvp, waitpid} from '../lib/libc.js'

let parser = new ArgumentParser({
  version: '0.0.1',
  description: 'A 2017 OS',
  addHelp: true,
})

parser.addArgument('command', {metavar: 'command', nargs: '?', help: 'command to execute', defaultValue: 'sh'})
parser.addArgument('args', {metavar: 'argument', nargs: '*', help: 'command arguments'})

async function main () {
  let {command, args} = parser.parseArgs()

  //process.argv = args

  let pid = await clone(() => execvp(command, args))
  let status = await waitpid(pid)

  return status
}

export default main()
