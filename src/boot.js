export default async function (options) {
  let boot

  if (typeof process !== 'undefined' && typeof require !== 'undefined') {
    boot = await System.import('./boot/node/boot.js')
  } else if (typeof location !== 'undefined' && typeof self !== 'undefined') {
    boot = await System.import('./boot/browser/boot.js')
  } else {
    throw new TypeError('Unsupported environment')
  }

  return await boot()
}
