// https://console.spec.whatwg.org/

export function Console () { }

let {error, info, log, warn} = console

Console.prototype = {error, info, log, warn}

export default Console
