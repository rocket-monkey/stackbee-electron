import { Component } from 'react'

export default class Admin extends Component {
  render() {
    const { globals, renderGlobals, appState } = this.props
    return (
      <div>
        <h2>Admin Area</h2>
      </div>
    )
  }
}
