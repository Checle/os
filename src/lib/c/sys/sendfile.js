import {BUFSIZ} from '../stdio.js'
import {SEEK_SET} from '../stdio.js'
import {lseek, read, write} from '../unistd.js'

export async function sendfile (outFd, inFd, offset, count = Infinity) {
  let buffer = new ArrayBuffer(BUFSIZ)
  let total = 0, size

  if (offset != null) lseek(inFd, offset, SEEK_SET)

  do {
    size = await read(inFd, buffer, Math.min(BUFSIZ, count - total))

    await write(outFd, buffer, size)

    total += size
  } while (size === BUFSIZ && total < count)

  return total
}
