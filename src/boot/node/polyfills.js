import 'isomorphic-fetch'
import 'web-streams-polyfill'
import URL from 'dom-urls'
import {TextDecoder, TextEncoder} from 'text-encoding-utf-8'
import {Realm} from '@checle/realms'

global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder
global.URL = URL
global.Realm = Realm
global.location = new URL('file://' + encodeURI(process.cwd()))
