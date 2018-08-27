import React from 'react'

const debug = false

export default (element, typeClass) => {
  if (!React.isValidElement(element)) {
    return false
  }

  if (!element.type) {
    console.warn('@helpers/isElementOfType: element with no type given!', element)
    return false
  }

  if (!element.type.name || element.type.name === '') {
    console.warn('@helpers/isElementOfType: PureFunctionComponent as element given, cannot determine type!', element)
    return false
  }

  const checkElement = new element.type({})
  const checkTypeClass = new typeClass({})

  if (!checkElement.getTypeStr) {
    debug && console.warn('@helpers/isElementOfType: element type has no "getTypeStr" method implemented!', element.type.name)
    return false
  }

  if (!checkTypeClass.getTypeStr) {
    debug && console.warn('@helpers/isElementOfType: typeClass has no "getTypeStr" method implemented!', typeClass)
    return false
  }

  return checkElement.getTypeStr() === checkTypeClass.getTypeStr()
}