// http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/dlfcn.h.html

export async function dlopen (file, mode = 0) {
  let handle = await syscall('instantiate', file)

  return Object.create(handle)
}

export function dlsym (handle, name) {
  return handle[name]
}

export function dlclose (handle) {
  Object.setPrototypeOf(handle, Object.prototype)
}
