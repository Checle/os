import boot from './dist/boot/node.js'
import libc from './dist/lib/libc.js'

const PROCESS = Symbol('process')

export default async function OS (...features) {
  let options = {}

  if (arguments.length && typeof arguments[arguments.length - 1] === 'object') {
    options = features.pop()
  }

  for (let feature of features) {
    options[feature] = true
  }

  let process = await boot(options)

  this[PROCESS] = process
}

for (let name in libc) {
  OS.prototype[name] = function () {
    return this[PROCESS].run(() => libc[name](...arguments))
  }
}
