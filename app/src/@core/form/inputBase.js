import React, { PureComponent } from 'react'
import { defineMessages } from 'react-intl'

const messages = defineMessages({
  validationIsRequired: {
    id: '@app.input.validation.required',
    description: 'Validation error for isRequired.',
    defaultMessage: 'Value cannot be empty'
  }
})

export default class InputBase extends PureComponent {
  state = {
    errorMsg: null
  }

  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
  }

  getTypeStr = () => 'InputBase'

  getMessages = (key) => messages[key]

  getValue = () => {
    return this.inputRef.current.value
  }

  setValue = (value) => {
    this.inputRef.current.value = value
  }

  reset = (resetValueToo) => {
    if (resetValueToo) {
      this.setValue('')
    }

    this.setState({ errorMsg: null })
  }

  handleAutoFocus = () => {
    const { autoFocus } = this.props
    if (autoFocus) {
      this.inputRef.current.focus()
    }
  }

  handleBlurOrChange = (event) => {
    this.validate(event)
  }

  componentDidUpdate(prevProps, prevState) {
    const isValidationStateChange = prevState.errorMsg !== this.state.errorMsg
    if (!isValidationStateChange) {
      this.handleAutoFocus()
    }
  }

  componentDidMount() {
    this.handleAutoFocus()
  }
}