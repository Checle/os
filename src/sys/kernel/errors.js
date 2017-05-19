export class SystemError extends Error {
  name = 'SystemError'

  constructor (code) {
    super(code)

    if ('captureStackTrace' in Error) Error.captureStackTrace(this)

    this.code = code
  }
}
