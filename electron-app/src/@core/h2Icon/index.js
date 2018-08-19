import { Component } from 'react'
import { colors, spacings, fontSizes } from '@styles'

export default class ModuleSite extends Component {
  render() {
    const { children } = this.props
    return (
      <div>
        {children}
        <style jsx>{`
          div {
            display: inline-block;
            vertical-align: middle;
            position: relative;
            margin-left: ${spacings.small};
            height: 15px;
            top: -9px;
          }
        `}</style>
      </div>
    )
  }
}
