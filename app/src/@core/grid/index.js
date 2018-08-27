import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'class-names'
import WithKeyPress from '@decorators/withKeyPress'
import H2Icon from '@core/h2Icon'
import Alert from '@core/alert'
import EditForm from './editForm'
import InfoPane from './infoPane'
import Sortable from './sortable'
import Paginator from '@core/paginator'
import IconBookDetailInfoNotebookRead from '@icons/IconBookDetailInfoNotebookRead'
import { colors, spacings, fontSizes, zIndexes } from '@styles'

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

class Grid extends Component {
  bodyRef = React.createRef()

  state = {
    focus: 0,
    edit: -1
  }

  resetEdit = () => {
    this.setState({ edit: -1 })
  }

  selectRow = (index) => {
    if (index === this.state.focus) {
      return
    }
    if (index) {
      return setTimeout(() => {
        this.setState({ focus: index })
      }, 10)
    }
  }

  editRow = (index) => {
    this.setState({ edit: index, focus: index })
  }

  setFocus = (event, index) => {
    if (index === this.state.focus) {
      return
    }
    if (index) {
      if (event && event.type === 'focus')
      return setTimeout(() => {
        this.setState({ focus: index  })
      }, 10)
    }

    this.setState({ focus: null })
  }

  onKeyDown = (event) => {
    const { loading, data, setPage } = this.props
    const { page = 0, pages = 0 } = data || {}
    const { code } = event

    switch (code) {
      case 'Escape':
        if (this.state.edit > -1) {
          this.setState({ edit: -1 })
        }
        return this.props.saveLastKeyDown(code)

    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  render() {
    const { loading, data, perPage, fields, editable = false } = this.props
    const { page = 0, pages = 0 } = data || {}

    return (
      <div className="table">
        {
          editable &&
          this.state.edit > -1 &&
          <EditForm loading={loading} fields={fields} edit={this.state.edit} docs={data && data.docs} />
        }

        <table className={classNames({ 'loading': loading, 'splitView': this.state.edit > -1 })}>
          <thead>
            <tr>
              <th className="tiny">#</th>
              {fields.map((field, index) => (
                <th key={`head-${index}`} className={classNames(field.cls, { 'focusHead': field.focus })}>
                  <div className="flexContainer">
                    <div>{field.head}</div>
                    <Sortable setSort={this.props.setSort} field={field.name} data={data} loading={loading} />
                  </div>
                </th>
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
                    <td className="tiny"><span>{index + offset + 1}</span><RowFocus index={index} focus={this.state.focus} onFocus={(event) => this.setFocus(event, index)} onBlur={(event) => this.setFocus(event, null)} /></td>
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
                <InfoPane data={data} perPage={perPage} />
              </th>
            </tr>
          </tfoot>
        </table>

        <style jsx>{`
          .table {
            position: relative;
            overflow: hidden;
            padding-bottom: 38px;
          }

          .flexContainer {
            display: flex;
          }

          .flexContainer > :global(div:first-child) {
            flex: 0 1 auto;
          }
          .flexContainer > :global(div) {
            flex: 0 1 90%;
          }

          table {
            display: block;
            height: calc(100vh - 200px);
            background: ${colors.whiteAlpha15}
          }

          tbody {
            display: block;
            height: calc(100vh - 222px);
            overflow-x: hidden;
            overflow-y: auto;
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
            z-index: ${zIndexes.top};
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
            white-space: nowrap;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
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
            white-space: nowrap;
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
          .base,
          .wide {
            width: 180px;
            text-align: left;
          }
          .tiny > :global(div),
          .small > :global(div),
          .base > :global(div),
          .wide > :global(div) {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .tiny {
            font-weight: bold;
            font-size: ${fontSizes.tiny};
            width: 38px;
          }

          .small{
            width: 90px;
          }

          .wide{
            width: 380px;
          }
        `}</style>
      </div>
    )
  }
}

export default WithKeyPress(Grid)
