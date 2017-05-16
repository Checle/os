import * as fs from 'fs'
import createBash from 'bashful'
import {spawn} from 'child_process'

let sh = createBash({
  env: process.env,
  spawn,
  write: fs.createWriteStream,
  read: fs.createReadStream,
  exists: fs.exists,
})

let stream = sh.createStream()

process.stdin.pipe(stream).pipe(process.stdout)
