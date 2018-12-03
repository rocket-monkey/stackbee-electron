import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import isElementOfType from '@helpers/isElementOfType'
import FormHelper from './formHelper'
import Input from '@core/form/input'
import FieldSet from '@core/form/fieldSet'
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

  validateAllFields = () => {
    let isValid = true
    const values = {}
    const errorMsgs = {}

    FormHelper.forAllFields({
      children: this.getChildren(),
      refs: this.refs,
      method: (ref, refName) => {
        const errorMsg = ref.validate()
        if (errorMsg) {
          isValid = false
          errorMsgs[refName] = errorMsg
        } else {
          values[refName] = ref.getValue()
        }
      }
    })

    this.setState({ isValid, errorMsgs, values })

    return { isValid, errorMsgs, values }
  }

  resetForm = (resetValueToo) => this.forAllInputFields(ref => ref.reset(resetValueToo))

  getFieldRef = (fieldName) => {
    let fieldRef = null
    FormHelper.forAllFields({
      children: this.getChildren(),
      refs: this.refs,
      method: (ref, refName) => {
        if (refName === fieldName) {
          fieldRef = ref
        }
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

  render() {
    const { fullScreen = false } = this.props
    const { loading } = this.state
    return (
      <form
        ref={this.formRef}
        onSubmit={this.handleSubmit}
        method="post"
        className={classNames({
          'loading': loading,
          'fullScreen': fullScreen
        })}
      >
        {FormHelper.renderChildren({ children: this.getChildren(), loading: this.state.loading, intl: this.props.intl })}

        <style jsx>{`
          form {
            display: inline-block;
          }

          .fullScreen {
            width: 50%;
            max-width: 500px;
            min-width: 300px;
            margin: 0 auto;
            position: relative;
            padding-bottom: 29px;
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