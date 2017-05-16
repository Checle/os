import {BUFSIZ} from '../stdio'
import {lseek, read, write, SEEK_SET} from '../unistd'

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
