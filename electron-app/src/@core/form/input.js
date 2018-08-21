import React, { Component } from 'react'
import classNames from 'class-names'
import { colors, spacings, fontSizes } from '@styles'

export default class Input extends Component {

  constructor(props) {
    super(props)

    this.inputRef = React.createRef()
    this.getValue = this.getValue.bind(this)
    this.setValue = this.setValue.bind(this)
  }

  getValue() {
    return this.inputRef.current.value
  }

  setValue(value) {
    this.inputRef.current.value = value
  }

  handleAutoFocus = () => {
    const { autoFocus } = this.props
    if (autoFocus) {
      this.inputRef.current.focus()
    }
  }

  componentDidUpdate() {
    this.handleAutoFocus()
  }

  componentDidMount() {
    this.handleAutoFocus()
  }

  render() {
    const { type = 'text', name = 'unset', value, placeholder, label, disabled, inverted } = this.props
    return (
      <div className={classNames({ 'inverted': inverted })}>
        {label && <label className={classNames('label', { 'disabled': disabled })}>{label}</label>}
        <input className="input" type={type} name={name} defaultValue={value} placeholder={placeholder} disabled={disabled} ref={this.inputRef} />

        <style jsx>{`
          div {
            display: flex;
            flex-direction: column;
            width: 100%;
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
            border: none;
            transition: all .5s ease;
          }

          .inverted :global(input) {
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