import { Component } from 'react'
import Alert from '@core/alert'
import PrinterParse from '@printers/parse'
import LoginRequired from '@core/loginRequired'

class Module extends Component {
  render() {
    const { module, appState } = this.props
    switch (module) {
      default:
        return <Alert type="warning">{`NO MODULE DEFINED FOR: ${module}`}</Alert>
      case 'printers':
        return <PrinterParse appState={appState} />
    }
  }
}

export default class ModuleSite extends Component {
  render() {
    const { appState } = this.props
    const queryParts = typeof location !== 'undefined' && location.search.split('=') || []
    const module = queryParts[1]
    return (
      <div>
        <LoginRequired appState={appState}>
          <Module module={module} appState={appState} />
        </LoginRequired>
      </div>
    )
  }
}
