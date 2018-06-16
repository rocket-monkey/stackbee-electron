import { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import { DbConnectionRequired } from '@core/alert'
import { tryToParseFiles } from './parser'

export default class PrintersParse extends Component {

  openFile = () => {
    const { dialog } = require('electron').remote

    dialog.showOpenDialog((fileNames) => {
      if (fileNames === undefined) return
      tryToParseFiles(fileNames)
     })
  }

  render () {
    const { globals, renderGlobals } = this.props
    return (
      <Fragment>
        <DbConnectionRequired {...globals} />

        {globals.dbConnected &&
        <button onClick={this.openFile}>
          <FormattedMessage id='@printers.parse.index' defaultMessage='Open File' />
        </button>}

        <ul>{renderGlobals()}</ul>
      </Fragment>
    )
  }
}
