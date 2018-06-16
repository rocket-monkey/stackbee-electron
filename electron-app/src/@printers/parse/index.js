import { Component } from 'react'
import WithGlobals from '@decorators/withGlobals'
import Alert from '@core/alert'
import { tryToParseFiles } from './parser'

class PrintersParse extends Component {

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
      <div>
        {
          globals.dbConnected &&
          <button onClick={this.openFile}>
            Open File
          </button>
        }
        {
          !globals.dbConnected &&
          <Alert>
            No db connection - you are offline!
          </Alert>
        }

        <p>{renderGlobals()}</p>
      </div>
    )
  }
}

export default WithGlobals(PrintersParse)
