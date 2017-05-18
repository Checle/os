import * as api from './api.js'
import {IDMap} from '../utils/pool.js'

export default class Namespace {
  api = Object.assign({}, api)
  processes = new IDMap()
}
