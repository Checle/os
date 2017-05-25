import './polyfills.js'
import NodeProccess from './process.js'
import Process from '../../sys/kernel/process.js'
import init from '../init.js'

export default async function boot (options) {
  process.on('unhandledRejection', (reason, promise) => { throw reason })

  Process.current = new NodeProccess(options)

  await Process.current.run(() => init(options))
}
