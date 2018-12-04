import React, { PureComponent, Fragment } from 'react'
import { colors, spacings, fontSizes } from '@styles'

export default class MetaData extends PureComponent {
  render () {
    const { addedTags } = this.props

    return (
      <div>
        {addedTags.map((t, i) => (
          <Fragment key={i}><span>{t}</span>{' '}</Fragment>
        ))}
        <style jsx>{`
          div {
            position: absolute;
            bottom: 0;
            right: 0;
          }
        `}</style>
      </div>
    )
  }
}
