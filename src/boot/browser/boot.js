import './polyfills.js'
import BrowserProcess from './process.js'
import Process from '../../sys/kernel/process.js'
import init from '../init.js'

export default async function boot (options) {
  zone.process = new BrowserProcess(options)

  await init()
}
