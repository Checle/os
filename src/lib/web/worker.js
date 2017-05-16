export class WorkerGlobalScope {
  get self () {
    return this
  }

  get console () {
    return console
  }
}
