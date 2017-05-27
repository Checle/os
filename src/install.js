export default async function main () {
  await waitpid(await clone(() => execlp('git', 'init')))
  await waitpid(await clone(() => execlp('git', 'add', '-A')))
  await waitpid(await clone(() => execlp('git', 'commit', '-m', 'Initial commit')))
}
