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
        {/* @see: https://loading.io/css/ */}
        <div className="lds-ripple"><div></div><div></div></div>
        <style jsx>{`
          .lds-ripple {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translateX(-50%) translateY(-50%);
            display: block;
            width: ${spacings.grande};
            height: ${spacings.grande};
          }
          .lds-ripple div {
            position: absolute;
            border: 4px solid ${colors.bright};
            opacity: 1;
            border-radius: 50%;
            animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
          }
          .lds-ripple div:nth-child(2) {
            animation-delay: -0.5s;
          }
          @keyframes lds-ripple {
            0% {
              top: 28px;
              left: 28px;
              width: 0;
              height: 0;
              opacity: 1;
            }
            100% {
              top: -1px;
              left: -1px;
              width: 58px;
              height: 58px;
              opacity: 0;
            }
          }

        `}</style>
      </Fragment>
    )
  }
}
