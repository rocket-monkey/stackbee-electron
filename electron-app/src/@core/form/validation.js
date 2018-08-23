import { Component } from 'react'
import { colors, spacings, fontSizes } from '@styles'

export default class Validation extends Component {
  render() {
    const { errorMsg } = this.props

    if (!errorMsg) {
      return null
    }

    return (
      <div>
        <span>{errorMsg}</span>

        <style jsx>{`
          div {
            position: absolute;
            bottom: ${spacings.base};
            left: 0;
          }

          span {
            color: ${colors.red};
            font-size: ${fontSizes.base};
            line-height: 1.2rem;
          }
        `}</style>
      </div>
    )
  }
}
