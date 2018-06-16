import { Component } from 'react'
import PrinterParse from '@printers/parse'

export default class Home extends Component {
  render () {
    return (
      <div>
        <h2>Home</h2>
        <PrinterParse />
      </div>
    )
  }
}
