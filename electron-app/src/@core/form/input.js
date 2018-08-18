import React, { Component } from 'react'

export default class Input extends Component {

  constructor(props) {
    super(props)

    this.inputRef = React.createRef()
    this.getValue = this.getValue.bind(this)
  }

  getValue() {
    return this.inputRef.current.value
  }

  componentDidMount() {
    const { autoFocus } = this.props
    if (autoFocus) {
      this.inputRef.current.focus()
    }
  }

  render() {
    const { type = 'text', name = 'unset', placeholder, label, disabled } = this.props
    return (
      <div>
        {label && <label className="label">{label}</label>}
        <input className="input" type={type} name={name} placeholder={placeholder} disabled={disabled} ref={this.inputRef} />

        <style jsx>{`
          div {
            display: flex;
            flex-direction: column;
            width: 100%;
          }

          .label {
            font-size: .65rem;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 6px;
            text-transform: uppercase;
          }

          .input {
            border-radius: 3px;
            margin-bottom: 15px;
            font-size: .8rem;
            height: 1.8rem;
            padding: .3rem;
            color: rgba(255, 255, 255, .5);
            background: rgba(155,155,155, .3);
            outline: none;
            border: none;
            transition: all .5s ease;
          }

          .input:hover,
          .input:focus {
            color: #333;
            background: rgba(255, 255, 255, .6);
          }

          .input:focus {
            box-shadow: inset rgba(35, 128, 251, .9) 0 0 8px;
          }
        `}</style>
      </div>
    )
  }
}