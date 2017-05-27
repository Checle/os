import * as crypto from 'crypto'
import * as subprocess from 'subprocess'
import {ArgumentParser} from 'argparse'
import {clone, getenc, getenv, getuid, execvp, fileno, mkstemp, open, read, setuid, tmpfile, waitpid, BUFSIZ} from '../lib/libc.js'
import {UID_RECORD} from '../lib/c/sys/record.js'

let parser = new ArgumentParser({
  version: '0.0.1',
  description: 'A 2017 OS',
  addHelp: true,
})

parser.addArgument('program', {metavar: 'program', nargs: '?', help: 'command to execute', defaultValue: 'js'})
parser.addArgument('args', {metavar: 'argument', nargs: '*', help: 'command arguments'})

async function isFile (filename) {
  try {
    program = await realpath(program)
  } catch (e) {
    return false
  }

  try {
    await access(program, X_OK)
  } catch (e) {
    return true
  }

  return false
}

async function main (program, ...args) {
  if (!arguments.length || program[0] === '-') {
    let options = parser.parseArgs()

    program = options.program
    args = options.args
  }

  if (await getuid() !== UID_RECORD) {
    await setuid(UID_RECORD)
  }

  let isLocal = await isFile(program)

  if (isLocal) {
    let filename
    let hash = crypto.createHash('sha256')
    let env = await getenv()
    let inputfd
    let [fd, tempname] = await mkstemp('/tmp/record-')

    if (program) {
      inputfd = await open(program)
    } else {
      inputfd = 0
    }

    for (let buffer; (buffer = await read(inputfd, null, BUFSIZ)); buffer) {
      hash.update(buffer)
      await write(fd, buffer)
    }

    let hashname = hash.digest('hex')

    await rename(tempname, '/record/' + hashname)

    let ents = await readdir('/record')
    let records = ents.filter(name => name[0] !== '.')

    for (let name of records) {
      if (name < hashname) await unlink('/record/' + name)
    }

    program = tempname
  }

  let status = await subprocess.call([program, args])

  if (status) return await exit(status)

  return status
}

export default main()
