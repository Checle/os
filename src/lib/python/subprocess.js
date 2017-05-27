import {clone, dup2, execl, waitpid, WEXITSTATUS, WIFEXITED} from '../libc.js'

export async function call (args, stdin, stdout, stderr, shell=false, timeout) {
  let pid = await clone(() => {
    if (stdin != null) dup2(stdin.fileno(), 0)
    if (stdout != null) dup2(stdout.fileno(), 1)
    if (stderr != null) dup2(stderr.fileno(), 2)

    if (shell) {
      if (typeof args === 'string') {
        args = [args]
      } else {
        args = args.map(JSON.stringify)
      }

      args = ['sh', '-c', ...args]
    } else if (typeof args === 'string') {
      args = [args]
    }

    execl(...args)
  })

  let status

  do {
    [pid, status] = await waitpid(pid)
  } while (!WIFEXITED(status))

  return WEXITSTATUS(status)
}
