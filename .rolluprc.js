import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import nodeBuiltins from 'rollup-plugin-node-builtins'
import nodeGlobals from 'rollup-plugin-node-globals'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'src/boot/browser.js',
  dest: 'dist/browser.js',
  format: 'iife',

  plugins: [
    babel({
      babelrc: false,
      runtimeHelpers: true,
      plugins: ['transform-runtime', 'transform-class-properties'],
      presets: ['es2017', 'es2016', 'es2015-rollup'],
      include: 'src/**',
    }),

    json(),
    nodeBuiltins(),
    nodeResolve(),
    commonjs(),
    nodeGlobals(),
  ],
}
