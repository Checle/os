import * as libc from '../lib/libc.js'
import * as libweb from '../lib/libweb.js'
import * as babel from 'babel-core'
import * as repl from 'repl'
import * as util from 'util'
import {ArgumentParser} from 'argparse'
import {instantiate} from '@record/web-assembly'
import {rollup} from 'rollup'
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

async function transform (filename) {
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

  return babel.transform(code, {
    babelrc: false,
    plugins: ['transform-es2015-modules-systemjs', 'transform-class-properties'],
    presets: ['es2017', 'es2016', 'es2015', 'babili'],
  })
}

function completer(line) {
  let completions = Object.keys(libc).concat(Object.keys(libweb), Object.keys(global)).sort()
  let hits = completions.filter(c => c.indexOf(line) === 0)

  return [hits, line];
}

async function main () {
  let options = parser.parseArgs()
  let {file, output, target, std} = options

  let evaluate = new Function('with(arguments[0])with(arguments[1])return function(){return eval(arguments[0])}')(libc, libweb)

  if (file === null) {
    let rs = repl.start({
      prompt: '> ',
      completer,
      writer: util.inspect,
      terminal: true,
      useColors: true,

      eval: (code, ...args) => {
        let callback = args.pop()
        let result = evaluate(code)

        if (result != null && typeof result.then === 'function') {
          result.then(value => callback(null, value), error => callback(error))
          return
        }

        callback(null, result)
      },
    })


    return
  }

  let {code, ast} = await transform(file)

  if (output === null) {
    let fn = new Function(code)

    return fn()
  }

  writeFileSync(output, code, {mode: options.execute ? 0o775 : 0o664})
}

main()
