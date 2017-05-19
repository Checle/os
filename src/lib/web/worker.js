// https://w3c.github.io/workers/

export class WorkerGlobalScope {
  get self () {
    return this
  }

  get console () {
    return console
  }
}
