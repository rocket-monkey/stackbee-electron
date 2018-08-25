const isObjectEmpty = (object) => {
  let count = 0
  let key = null
  for (key in object) {
    if (object.hasOwnProperty(key)) {
      count += 1
    }
  }

  return count === 0
}

export default object => Object.keys(object).length === 0