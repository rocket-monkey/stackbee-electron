import React, { PureComponent } from 'react'
import { colors, spacings, fontSizes } from '@styles'

export default class Image extends PureComponent {
  render () {
    const { ...restProps } = this.props

    return (
      <img {...restProps} />
    )
  }
}
