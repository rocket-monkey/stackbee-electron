import React, { Component } from 'react'
import { defineMessages } from 'react-intl'
import classNames from 'class-names'
import Validation from './validation'
import { colors, spacings, fontSizes } from '@styles'

const msgs = defineMessages({
  validationIsRequired: {
    id: '@app.input.validation.required',
    description: 'Validation error for isRequired.',
    defaultMessage: 'Value cannot be empty'
  }
})
export default class Input extends Component {
  state = {
    errorMsg: null
  }

  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
  }

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

  validate = (event) => {
    const { isRequired } = this.props
    const { errorMsg } = this.state

    const isChangeEvent = event && event.type === 'change'

    if (errorMsg && !isChangeEvent) {
      return errorMsg
    }

    const value = this.getValue()

    let newErrorMsg = null
    if (isRequired && value.length === 0) {
      newErrorMsg = this.props.intl.formatMessage(msgs.validationIsRequired)
    }

    if (newErrorMsg !== errorMsg) {
      this.setState({ errorMsg: newErrorMsg })
    }

    return newErrorMsg
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

  render() {
    const { type = 'text', name = 'unset', value, placeholder, label, disabled, inverted } = this.props
    const { errorMsg } = this.state
    return (
      <div className={classNames({ 'inverted': inverted, 'error': errorMsg !== null })}>
        {label && <label className={classNames('label', { 'disabled': disabled })}>{label}</label>}
        <input
          className="input"
          type={type}
          name={name}
          defaultValue={value}
          placeholder={placeholder}
          disabled={disabled}
          ref={this.inputRef}
          onBlur={this.handleBlurOrChange}
          onChange={this.handleBlurOrChange}
        />
        <Validation errorMsg={this.state.errorMsg} />

        <style jsx>{`
          div {
            display: flex;
            flex-direction: column;
            width: 100%;
            position: relative;
            padding-bottom: ${spacings.medium};
          }

          .label {
            font-size: ${fontSizes.tiny};
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: ${spacings.small};
            text-transform: uppercase;
          }

          .disabled {
            cursor: inherit;
            opacity: .75;
          }

          .inverted :global(.label) {
            color: ${colors.dark};
          }

          .input {
            border-radius: ${spacings.radiusTiny};
            margin-bottom: ${spacings.big};
            font-size: ${fontSizes.base};
            height: 1.8rem;
            padding: .3rem;
            color: ${colors.whiteAlpha50};
            background: ${colors.grayLight};
            outline: none;
            border: 1px solid ${colors.grayLight};
            transition: all .5s ease;
          }

          .error > :global(input) {
            border: 1px solid ${colors.red};
            box-shadow: inset ${colors.redDark} 0 0 ${spacings.focusShadow} !important;
          }

          .inverted > :global(input) {
            color: ${colors.dark};
            background: ${colors.whiteAlpha35};
          }

          .input:not([disabled]):hover,
          .input:not([disabled]):focus {
            color: ${colors.gray};
            background: ${colors.whiteAlpha60};
          }

          input[disabled] {
            cursor: inherit;
          }

          .input:focus {
            box-shadow: inset ${colors.focusShadow} 0 0 ${spacings.focusShadow};
          }
        `}</style>
      </div>
    )
  }
}
