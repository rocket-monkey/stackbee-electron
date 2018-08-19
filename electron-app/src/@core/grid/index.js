import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'class-names'
import IconBookDetailInfoNotebookRead from '@icons/IconBookDetailInfoNotebookRead'
import H2Icon from '@core/h2Icon'
import Button from '@core/button'
import Input from '@core/form/input'
import Alert from '@core/alert'
import Paginator from '@core/paginator'
import { colors, spacings, fontSizes, zIndexes } from '@styles'

class EditForm extends Component {
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
    const { refs } = this.state

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
    const { docs = [] } = this.props
    const { refs, edit } = this.state
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
    const { fields, loading, docs } = this.props
    const { edit } = this.state

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
            background: ${colors.grayLightAlpha9};
            transform: translateX(80%);
            opacity: 0;
            transition: all .5s ease;
            padding: ${spacings.big} ${spacings.base};
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

class RowFocus extends Component {
  inputRef = React.createRef()

  componentDidMount() {
    if (this.props.index === this.props.focus) {
      this.inputRef.current.focus()
    }
  }

  render() {
    const { onFocus, onBlur, index } = this.props
    return (
      <Fragment>
        <input ref={this.inputRef} type="checkbox" name={`row-focus-${index}`} onFocus={onFocus} onBlur={onBlur} />

        <style jsx>{`
          input {
            width: 0;
            margin: 0;
            opacity: .01;
          }
        `}</style>
      </Fragment>
    )
  }
}

let lastKeyCode = null

export default class Grid extends Component {
  bodyRef = React.createRef()

  state = {
    focus: 0,
    edit: -1
  }

  constructor(props) {
    super(props)

    this.resetEdit = this.resetEdit.bind(this)
    this.selectRow = this.selectRow.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  resetEdit() {
    this.setState({ edit: -1 })
  }

  selectRow(index) {
    if (index === this.state.focus) {
      return
    }
    if (index) {
      return setTimeout(() => {
        this.setState({ focus: index })
      }, 10)
    }
  }

  editRow(index) {
    this.selectRow(index)
    this.setState({ edit: index })
  }

  setFocus(index) {
    if (index === this.state.focus) {
      return
    }
    if (index) {
      return setTimeout(() => {
        this.setState({ focus: index  })
      }, 10)
    }

    this.setState({ focus: null })
  }

  onKeyDown(event) {
    const { loading, data, setPage } = this.props
    const { page = 0, pages = 0 } = data || {}
    const { code } = event

    switch (code) {
      case 'Escape':
        if (this.state.edit > -1) {
          this.setState({ edit: -1 })
        }
        return lastKeyCode = code

    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  render() {
    const { loading, data, perPage, fields } = this.props
    const { page = 0, pages = 0 } = data || {}

    return (
      <div>
        <EditForm loading={loading} fields={fields} edit={this.state.edit} docs={data && data.docs} />
        <table className={classNames({ 'loading': loading, 'splitView': this.state.edit > -1 })}>
          <thead>
            <tr>
              <th className="tiny">#</th>
              {fields.map((field, index) => (
                <th key={`head-${index}`} className={classNames(field.cls, { 'focusHead': field.focus })}>{field.head}</th>
              ))}
            </tr>
          </thead>
          <tbody ref={this.bodyRef}>
            {(!loading && data && data.docs) && data.docs.map((doc, index) => {
              const offset = page * perPage
              const colSpan = fields.length + 1
              return (
                <Fragment key={`csvdata-entry-${index}`}>
                  <tr className={classNames({ 'focus': this.state.focus === index || this.state.edit === index })} onClick={() => this.selectRow(index)} onDoubleClick={() => this.editRow(index)}>
                    <td className="tiny"><span>{index + offset + 1}</span><RowFocus index={index} focus={this.state.focus} onFocus={() => this.setFocus(index)} onBlur={() => this.setFocus(null)} /></td>
                    {fields.map((field, index) => (
                      <td key={`content-${index}`} className={classNames(field.cls, { 'focus': field.focus })}>
                        <span>{doc[field.name]}</span>
                      </td>
                    ))}
                  </tr>
                </Fragment>
              )
            })}
            {(loading && data && data.docs) && data.docs.map((doc, index) => {
              const offset = page * perPage
              return (
                <tr className="loadingRow" key={`csvdata-entry-${index}`}>
                  <td className="tiny"><span>{index + offset + 1}</span></td>
                  {fields.map((field, index) => (
                    <td key={`loading-${index}`} className={classNames(field.cls, { 'focus': field.focus })}><span>&nbsp;</span></td>
                  ))}
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={3}>
                <Paginator resetEdit={this.resetEdit} data={data} setPage={this.props.setPage} bodyRef={this.bodyRef.current} loading={loading} />
              </th>
            </tr>
          </tfoot>
        </table>

        <style jsx>{`
          div {
            position: relative;
            overflow: hidden;
            padding-bottom: 38px;
          }

          table {
            display: block;
            height: calc(100vh - 200px);
            background: ${colors.whiteAlpha15}
          }

          tbody {
            display: block;
            height: calc(100vh - 222px);
            overflow: auto;
            background: ${colors.whiteAlpha60};
            color: ${colors.dark};
            position: relative;
            padding-bottom: 28px;
          }

          table:after,
          table:before {
            content: '';
            height: calc(100% - 59px);
            width: 100%;
            position: absolute;
            left: 0;
            pointer-events: none;
            z-index: ${zIndexes.high};
          }

          table:before {
            top: 21px;
            box-shadow: inset ${colors.blackAlpha35} 0 -2px 15px;
          }

          table:after {
            height: 32px;
            bottom: 38px;
            background: linear-gradient(transparent, #bfbfbf);
          }

          thead,
          tfoot {
            display: block;
            position: relative;
            width: 100%;
          }

          thead {
            z-index: ${zIndexes.high};
            box-shadow: ${colors.blackAlpha25} 0 2px 5px;
          }

          tr {
            display: block;
          }

          th, td {
            display: inline-block;
          }

          th {
            font-size: ${fontSizes.tiny};
            text-transform: uppercase;
            border-right: 1px solid ${colors.grayAlpha60};
            padding: ${spacings.tiny} ${spacings.small};
            position: relative;
            top: -1px;
          }

          tr:nth-child(odd) :global(td) {
            background: ${colors.whiteAlpha40};
          }

          .loading {
            cursor: progress;
          }

          tfoot :global(th) {
            width: calc(100% + 1px);
            background: linear-gradient(${colors.whiteAlpha25}, ${colors.whiteAlpha15});
            text-align: left;
            border-radius: 0 0 ${spacings.radiusTiny} ${spacings.radiusTiny};
          }

          td {
            height: 25px;
            border-right: 1px solid ${colors.grayAlpha60};
          }

          td :global(span) {
            font-size: ${fontSizes.small};
            line-height: 1.2rem;
            padding: ${spacings.tiny} ${spacings.small};
          }

          tr:nth-child(odd) :global(.focus) {
            background: ${colors.yellowLightAlpha70};
          }
          .focus {
            background: ${colors.yellowAlpha70};
          }
          .focusHead {
            background: ${colors.yellowAlpha30};
          }

          tr {
            display: block;
            border-bottom: 1px solid ${colors.grayAlpha60};
          }

          tbody :global(tr:hover),
          tbody :global(tr:nth-child(odd):hover) {
            background: ${colors.yellowAlpha20};
          }

          .splitView {

          }

          .tiny,
          .small,
          .base {
            width: 180px;
            text-align: left;
          }
          .tiny :global(span),
          .small :global(span),
          .base :global(span) {
            display: inline-block;
            width: 180px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .tiny {
            font-weight: bold;
            width: 38px;
          }
          .tiny :global(span) {
            font-size: ${fontSizes.tiny};
            width: 38px;
          }
          .small {
            width: 90px;
          }
          .small :global(span) {
            width: 90px;
          }
        `}</style>
      </div>
    )
  }
}
