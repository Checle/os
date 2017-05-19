import 'isomorphic-fetch'
import 'web-streams-polyfill'
import URL from 'dom-urls'
import {TextDecoder, TextEncoder} from 'text-encoding-utf-8'

global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder
global.URL = URL
