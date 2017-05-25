import * as api from './api.js'
import Index from '../utils/index.js'
import {IDMap} from '../utils/pool.js'

export default class Namespace {
  api = Object.assign({}, api)
  processes = new IDMap()
  mounts = new Index()
  encoding = 'utf-8'
  loader = null
}
