import { Component, Fragment } from 'react'
import { colors, spacings } from '@styles'

export default class Loading extends Component {
  componentDidMount() {
    // open dev-tools in production
    const { globalShortcut, BrowserWindow } = require('electron').remote
    globalShortcut.register('CommandOrControl+Shift+Z', () => {
      BrowserWindow.getFocusedWindow().webContents.openDevTools()
    })

    window.addEventListener('beforeunload', () => {
      globalShortcut.unregisterAll()
    })
  }

  render() {
    return (
      <Fragment>
        <div className="loading" />
        <style jsx>{`
          .loading {
            position: absolute;
            top: 0;
            left: 0;
            display: block;
            width: 100%;
            height: 100%;
            cursor: progress;
          }
        `}</style>
      </Fragment>
    )
  }
}
