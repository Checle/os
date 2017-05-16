import Api from './api'
import {IDMap} from '../utils/pool'

export default class Namespace {
  api = new Api()
  processes = new IDMap()
}
