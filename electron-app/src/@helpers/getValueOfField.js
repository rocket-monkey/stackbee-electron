export default (obj, search) => {
  const keys = Object.keys(obj)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    if (encodeURI(key) === search) {
      return obj[key]
    }
  }

  return null
}