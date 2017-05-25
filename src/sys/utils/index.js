import {sortedIndexOf} from '../utils.js'

export default class Index extends Array {
  add (key) {
    let index = this.indexOf(key)

    if (index === this.length || this[index] !== key) {
      this.splice(index, 0, key)
    }
  }

  set (key, value) {
    this.add(key)

    this[key] = value
  }

  get (key) {
    return this[key]
  }

  has (key) {
    return this.hasOwnProperty(key)
  }

  delete (key) {
    let index = this.indexOf(key)

    delete this[key]

    if (index === this.length || this[index] !== key) {
      return false
    }

    return true
  }

  indexOf (key) {
    return sortedIndexOf(this, key)
  }
}
