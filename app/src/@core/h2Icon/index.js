import { Component } from 'react'
import classNames from 'class-names'
import { colors, spacings, fontSizes } from '@styles'

export default class H2Icon extends Component {
  render() {
    const { children, small = false } = this.props
    return (
      <div className={classNames({ 'small': small })}>
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

          .small {
            width: 23px;
            margin-left: ${spacings.tiny};
          }
          .small :global(svg) {
            transform-origin: center left;
            transform: scale(.7);
            margin: 0;
            transition: all .5s ease;
          }
        `}</style>
      </div>
    )
  }
}
