import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import {ArgumentParser} from 'argparse'
import {rollup} from 'rollup'
import {writeFileSync} from 'fs'

let parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'ECMAScript compiler and interpreter',
})

parser.addArgument('file', {metavar: 'file', help: 'source file'})
parser.addArgument(['-o', '--output'], {metavar: 'outfile', help: 'write code to file rather than executing'})
parser.addArgument(['-t', '--target'], {metavar: 'format', help: 'specify compilation target'})
parser.addArgument(['-C', '--no-compress'], {action: 'storeFalse', dest: 'compress', help: 'output code in readable format'})
parser.addArgument(['-X', '--no-exec'], {action: 'storeFalse', dest: 'execute', help: 'do not execute and do not mark output files executable'})
parser.addArgument(['--std'], {metavar: 'format', help: 'set input source language or get supported'})

async function main () {
  let options = parser.parseArgs()

  let {file, output, target, std} = options

  let bundle = await rollup({
    entry: file,
    plugins: [
      babel({
        babelrc: false,
        runtimeHelpers: true,
        plugins: ['transform-class-properties'],
        presets: ['es2017', 'es2016', 'es2015-rollup'],
      }),
      uglify(),
    ],
  })
  let result = bundle.generate({format: 'iife'})

  if (output === null) {
    let fn = new Function(result.code)

    return fn()
  }

  writeFileSync(output, result.code, {mode: options.execute ? 0o775 : 0o664})
}

main()
