import './polyfills.js'
import NodeProccess from './process.js'
import Process from '../../sys/kernel/process.js'
import init from '../init.js'

export default async function boot (options) {
  zone.process = new NodeProccess(options)

  await zone.process.run(() => init(options))
}
