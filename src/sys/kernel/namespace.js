import * as api from './api.js'
import Index from '../utils/index.js'
import {IDMap} from '../utils/pool.js'
import {BrowserLoader} from '../../lib/web/loader.js'

export default class Namespace {
  api = Object.assign({}, api)
  processes = new IDMap()
  mounts = new Index()
  encoding = 'utf-8'
  loader = new BrowserLoader()
}
