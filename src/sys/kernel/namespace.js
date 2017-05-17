import * as api from './api'
import {IDMap} from '../utils/pool'

export default class Namespace {
  api = Object.assign({}, api)
  processes = new IDMap()
}
