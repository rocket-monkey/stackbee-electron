import { Component } from 'react'
import PrinterParse from '@printers/parse'

export default class Home extends Component {
  render () {
    const { globals, renderGlobals } = this.props
    return (
      <div>
        <h2>Home</h2>
        <PrinterParse globals={globals} renderGlobals={renderGlobals} />
      </div>
    )
  }
}
