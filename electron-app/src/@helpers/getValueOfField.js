export default (obj, search) => {
  const keys = Object.keys(obj)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    if (
      key.indexOf(search[0]) > -1 &&
      key.indexOf(search[1]) > -1
    ) {
      return obj[key]
    }
  }

  return null
}