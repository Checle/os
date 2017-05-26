import './polyfills.js'
import BrowserProcess from './process.js'
import Process from '../../sys/kernel/process.js'
import init from '../init.js'

export default async function boot (options) {
  let process = new BrowserProcess(options)

  process.enter()

  await init()
}
