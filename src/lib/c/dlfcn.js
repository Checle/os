let handles = {}

export async function dlopen (file, mode = 0) {
  let handle = await System.import(file)
  let symbol = Symbol(file)

  handles[symbol] = handle

  return symbol
}

export function dlsym (handle, name) {
  return handles[handle][name]
}

export function dlclose (handle) {
  delete handles[handle]
}
