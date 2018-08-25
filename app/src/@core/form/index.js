import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import isElementOfType from '@helpers/isElementOfType'
import Input from '@core/form/input'
import classNames from 'class-names'

const isDev = require('electron-is-dev')

class Form extends Component {
  state = {
    loading: false,
    errorMsgs: {},
    values: {}
  }

  constructor(props) {
    super(props)
    this.formRef = React.createRef()
  }

  isTypeSupported = (child) => {
    // check for props that _must_ exist on every input field - and no others involved in form-building!
    // -> super stupid i know, but any "instanceof" or class instantiation and checking with functions that return types as string fails in prod
    // return !!child && !!child.props && !!child.props.name && (!!child.props.label || !!child.props.placeholder)
    return isElementOfType(child, Input)
  }

  forAllFields = (method) => {
    React.Children.map(this.getChildren(), (child, index) => {
      if (this.isTypeSupported(child)) {
        const inputRef = this.refs[child.props.name]
        method(inputRef, child.props.name)
      }
    })
  }

  validateAllFields = () => {
    let isValid = true
    const values = {}
    const errorMsgs = {}

    this.forAllFields((ref, refName) => {
      const errorMsg = ref.validate()
      if (errorMsg) {
        isValid = false
        errorMsgs[refName] = errorMsg
      } else {
        values[refName] = ref.getValue()
      }
    })

    this.setState({ isValid, errorMsgs, values })

    return { isValid, errorMsgs, values }
  }

  resetForm = (resetValueToo) => this.forAllInputFields(ref => ref.reset(resetValueToo))

  getFieldRef = (fieldName) => {
    let fieldRef = null
    this.forAllInputFields((ref, refName) => {
      if (refName === fieldName) {
        fieldRef = ref
      }
    })

    return fieldRef
  }

  handleSubmit = (event) => {
    event.preventDefault()

    const { isValid, errorMsgs, values } = this.validateAllFields()

    let submitPromise = null
    if (isValid) {
      if (this.state.loading === true) {
        return isDev && console.info('Form: is already loading...')
      }

      this.setState({ loading: true })

      const { onSubmit } = this.props

      const onResolveOrCatch = () => {
        this.setState({ loading: false })
      }

      if (onSubmit) {
        submitPromise = onSubmit(values)
      }

      isDev && !onSubmit && console.warn('Form: no "onSubmit" function given!')

      if (submitPromise && submitPromise.then) {
        return submitPromise.then(onResolveOrCatch).catch(onResolveOrCatch)
      }

      isDev && console.warn('Form: "onSubmit" did not return a promise!')
    }
    return console.warn('Form: validation errors!', errorMsgs)
  }

  getChildren = () => {
    const { isValid, loading } = this.state
    const { children } = this.props
    const formChildren = children(isValid, loading, this.resetForm, this.getFieldRef)
    return formChildren.props.children
  }

  renderChildren = () => {
    return React.Children.map(this.getChildren(), (child, index) => {
      if (this.isTypeSupported(child)) {
        return React.createElement(child.type, {
          ...child.props,
          key: `form-child-${index}`,
          loading: this.state.loading,
          intl: this.props.intl,
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

  render() {
    const { fullWidth = false } = this.props
    const { loading } = this.state
    return (
      <form
        ref={this.formRef}
        onSubmit={this.handleSubmit}
        method="post"
        className={classNames({
          'loading': loading,
          'fullWidth': fullWidth
        })}
      >
        {this.renderChildren()}

        <style jsx>{`
          form {
            width: 50%;
            max-width: 500px;
            min-width: 300px;
            margin: 0 auto;
            position: relative;
            padding-bottom: 29px;
          }

          .fullWidth {
            width: 100%;
            max-width: initial;
          }

          .loading {
              cursor: progress;
            }
        `}</style>
      </form>
    )
  }
}

export default injectIntl(Form)