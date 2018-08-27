import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'class-names'
import Button from '@core/button'
import Input from '@core/form/input'
import { colors, spacings, fontSizes, zIndexes } from '@styles'

export default class EditForm extends Component {
  formRef = React.createRef()

  state = {
    edit: -1,
    refs: []
  }

  constructor(props) {
    super(props)

    this.addRef = this.addRef.bind(this)
  }

  addRef(element) {
    if (!element) {
      return
    }
    const { refs  } = this.state

    const filtered = refs.filter(ref => ref.name === element.name)
    if (filtered.length > 0) {
      return
    }

    refs.push(element)
    this.setState({ refs })
  }

  handleSubmit = (event) => {
    event.preventDefault()
  }

  static getDerivedStateFromProps(props, state) {
    if (props.edit !== state.edit) {
      return { edit: props.edit }
    }
    return null
  }

  componentDidUpdate() {
    const { docs = []  } = this.props
    const { refs, edit  } = this.state
    const found = (docs || []).filter((doc, index) => index === edit)
    if (!found.length) {
      return
    }

    const data = found.pop()

    refs.forEach(ref => {
      if (ref.inputRef.current) {
        const fieldName = ref.inputRef.current.name
        ref.setValue(data[fieldName])
      }
    })
  }

  componentDidMount() {
    this.setState({ edit: this.props.edit })
  }

  render() {
    const { fields, loading, docs, edit } = this.props

    if (!docs) {
      return null
    }

    const found = docs.filter((doc, index) => index === edit)
    const data = found.length && found.pop() || {}

    return (
      <Fragment>
        <form ref={this.formRef} className={classNames({ 'active': edit > -1 && !loading })} onSubmit={this.handleSubmit.bind(this)}>
          {fields.map((field, index) => {
            const { type = 'String' } = field
            switch (type) {
              default:
              case 'String':
                return <Input key={`edit-form-element-${index}`} type="text" value={data[field.name]} name={field.name} inverted autoFocus={index === 0} label={`${field.name} [${type}]`} ref={element => this.addRef(element)} />
            }
          })}

          <Button type="submit" primary floatRight>
            <FormattedMessage id='@app.printer.editData.submit' defaultMessage='Save' />
          </Button>
        </form>

        <style jsx>{`
          form {
            position: absolute;
            top: 21px;
            width: 50%;
            bottom: 38px;
            right: 0;
            z-index: ${zIndexes.top};
            background: linear-gradient(${colors.grayLightAlpha9}, ${colors.grayLightAlpha80});
            transform: translateX(80%);
            opacity: 0;
            transition: all .5s ease;
            padding: ${spacings.big} ${spacings.base};
            border-left: 1px solid ${colors.grayAlpha20};
            box-shadow: ${colors.grayAlpha40} -2px 1px 9px;
          }

          .active {
            transform: translateX(0);
            opacity: 1;
          }
        `}</style>
      </Fragment>
    )
  }
}
