import * as repl from 'repl'
import {ArgumentParser} from 'argparse'
import {instantiate} from '@record/web-assembly'
import {rollup} from 'rollup'
import {transform} from 'babel-core'
import {writeFileSync} from 'fs'

let parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'ECMAScript compiler and interpreter',
})

parser.addArgument('file', {metavar: 'file', nargs: '?', help: 'source file'})
parser.addArgument(['-o', '--output'], {metavar: 'outfile', help: 'write code to file rather than executing'})
parser.addArgument(['-t', '--target'], {metavar: 'format', help: 'specify compilation target'})
parser.addArgument(['-C', '--no-compress'], {action: 'storeFalse', dest: 'compress', help: 'output code in readable format'})
parser.addArgument(['-X', '--no-exec'], {action: 'storeFalse', dest: 'execute', help: 'do not execute and do not mark output files executable'})
parser.addArgument(['--std'], {metavar: 'format', help: 'set input source language or get supported'})

async function process (filename) {
  let bundle = await rollup({
    entry: filename,

    onwarn (warning) {
      if (warning.code === 'UNRESOLVED_IMPORT') return

      console.warn(warning.message)
    },
  })

  let result = bundle.generate({format: 'es'})
  let code = result.code

  code = code.replace(/^#!.*\n/, '')

  return transform(code, {
    babelrc: false,
    plugins: ['transform-es2015-modules-systemjs', 'transform-class-properties'],
    presets: ['es2017', 'es2016', 'es2015', 'babili'],
  })
}

async function main () {
  let options = parser.parseArgs()
  let {file, output, target, std} = options

  if (file === null) {
    /*
    let {module, instance} = instantiate('callback(function(code){eval(code)})', {
      callback (evaluate) {
        repl.start({prompt: '> ', eval: evaluate})
      }
    })
    */
    repl.start({prompt: '> '})

    return
  }

  let {code, ast} = await process(file)

  if (output === null) {
    let fn = new Function(code)

    return fn()
  }

  writeFileSync(output, code, {mode: options.execute ? 0o775 : 0o664})
}

main()
