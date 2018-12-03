import React from 'react'
import isElementOfType from '@helpers/isElementOfType'
import Input from '@core/form/input'
import FieldSet from '@core/form/fieldSet'

export default class FormHelper {
  static isTypeSupported = (child) => (
    isElementOfType(child, Input) ||
    isElementOfType(child, FieldSet)
  )

  static forAllFields = ({ children, refs, method }) => {
    React.Children.map(children, child => {
      if (FormHelper.isTypeSupported(child)) {
        const inputRef = refs[child.props.name]
        inputRef && method(inputRef, child.props.name)
      }
    })
  }

  static renderChildren = ({ children, loading, intl }) => {
    return React.Children.map(children, (child, index) => {
      if (FormHelper.isTypeSupported(child)) {
        return React.createElement(child.type, {
          ...child.props,
          key: `form-child-${index}`,
          loading: loading,
          intl: intl,
          ref: child.props.name
        }, child.props.children)
      } else {
        return React.createElement(child.type, {
          ...child.props,
          key: `form-child-${index}`
        }, child.props.children)
      }
    })
  }
}