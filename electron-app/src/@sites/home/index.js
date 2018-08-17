import { Component } from 'react'
import PrinterParse from '@printers/parse'
import LoginRequired from '@core/loginRequired'

export default class Home extends Component {
  render () {
    const { globals, renderGlobals, appState } = this.props
    return (
      <div>
        <h2>Home</h2>
        <LoginRequired appState={appState}>
          <PrinterParse globals={globals} renderGlobals={renderGlobals} />
        </LoginRequired>
      </div>
    )
  }
}
