import {sortedIndexOf} from '../utils'

export class Pool {
  free = []

  create () {
    throw 'Not implemented'
  }

  constructor (source) {
    if (source) this.free = source.free.concat()
  }

  acquire () {
    if (!this.free.length) return this.create()

    return this.free.shift()
  }
  release (object) {
    this.free.splice(sortedIndexOf(this.free, object), 0, object)

    return true
  }
}

export class IDPool extends Pool {
  id = 0

  create () {
    return this.id++
  }
}

export class IDMap extends Map {
  ids = new IDPool()

  constructor (source) {
    super(source)

    if (source) this.ids = new IDPool(source.ids)
  }

  add (value) {
    let id = this.ids.create()

    this.set(id, value)

    return id
  }

  delete (id) {
    return super.delete(id) && this.ids.release(id)
  }
}
