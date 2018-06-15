import { Component } from 'react'

export default class Layout extends Component {
  render () {
    return (
      <div>
        <h2>This is Next.js dd</h2>
        {this.props.children}
      </div>
    )
  }
}
