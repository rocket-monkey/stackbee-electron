import React, { Component } from 'react'
import classNames from 'class-names'
import InputBase from './inputBase'
import Validation from './validation'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import { colors, spacings, fontSizes, zIndexes } from '@styles'

import 'react-datepicker/dist/react-datepicker.css'

export default class DatePickerInput extends InputBase {
  state = {
    value: moment(),
    errorMsg: null
  }

  handleChange = (date) => {
    const { handleChange = () => {} } = this.props
    this.setState({ value: date })
    handleChange(date)
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
      newErrorMsg = this.props.intl.formatMessage(this.getMessages('validationIsRequired'))
    }

    if (newErrorMsg !== errorMsg) {
      this.setState({ errorMsg: newErrorMsg })
    }

    return newErrorMsg
  }

  render() {
    const { type = 'text', name = 'unset', value, placeholder, label, disabled, inverted } = this.props
    const { errorMsg } = this.state
    return (
      <div className={classNames({ 'inverted': inverted, 'error': errorMsg !== null })}>
        {label && <label className={classNames('label', { 'disabled': disabled })}>{label}</label>}
        <DatePicker
          dateFormat="DD.MM.YYYY"
          selected={this.state.value}
          onChange={this.handleChange}
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

          :global(.react-datepicker-popper) {
            z-index: ${zIndexes.high};
          }
        `}</style>
      </div>
    )
  }
}
