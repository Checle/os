import {getpid, getuid} from '../../lib/c/unistd.js'
import {System} from '../../lib/web/system.js'
import {ArgumentParser} from 'argparse'
import {readFileSync} from 'fs'

let parser = new ArgumentParser({
  version: '7.6.0',
  addHelp: true,
})

let group = parser.addMutuallyExclusiveGroup()

group.addArgument(['filename'], {metavar: 'script.js', help: 'source file', nargs: '?'})
group.addArgument(['-e', '--eval'], {dest: 'code', metavar: 'code', help: 'evaluate script'})
parser.addArgument(['-p', '--print'], {action: 'storeTrue', help: 'evaluate script and print result'})
parser.addArgument(['-c', '--check'], {action: 'storeTrue', help: 'syntax check script without executing'})
parser.addArgument(['-i', '--interactive'], {action: 'storeTrue', help: 'always enter the REPL even if stdin does not appear to be a terminal'})
parser.addArgument(['-r', '--require'], {metavar: 'module.js', help: 'module to preload (option can be repeated)'})
parser.addArgument('args', {metavar: 'argument', nargs: '*', help: 'additional program arguments'})

class NodeGlobalScope {
  global = this
  console = console

  constructor (process) {
    this.process = process
  }

  syscall (name, ...args) {
    return syscall(name, ...args)
  }

  require (filename) {
    return System.import(filename)
  }
}

NodeGlobalScope.prototype.require.resolve = function resolve (filename) {
  return System.resolve(filename)
}

async function main () {
  let pid = await getpid()
  let uid = await getuid()
  let process = {
    pid,

    getuid () {
      return uid
    }
  }
  let options = parser.parseArgs()
  let {filename, require, args, code} = options
  let id

  if (code !== null) {
    id = '[eval]'

    if (options.print) {
      code = `console.dir(eval(${JSON.stringify(code)}))`
    }
  } else if (filename !== null) {
    id = '.'

    code = readFileSync(filename, {encoding: 'utf-8'})
  }

  let module = new Module('')

  // instantiate(code, new NodeGlobalScope(process))
}

main()
