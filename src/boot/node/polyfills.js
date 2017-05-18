import 'web-streams-polyfill'
import URL from 'dom-urls'
import fetch from 'node-fetch'
import {TextDecoder, TextEncoder} from 'text-encoding-utf-8'

global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder
global.URL = URL
global.fetch = fetch
