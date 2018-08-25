import React, { Component, Fragment } from 'react'
import classNames from 'class-names'
import { colors, spacings, fontSizes } from '@styles'

export default class Button extends Component {
  hasOnlyOneRealReactElementChild = (children) => {
    if (!children) {
      return false
    }

    const count = React.Children.count(children)
    return React.isValidElement(children[0]) && count === 1
  }

  onClick = (event) => {
    const { onClick } = this.props
    if (onClick) {
      onClick(event)
    }
  }

  render() {
    const { type = 'submit', primary, floatRight, disabled, title, children } = this.props
    return (
      <Fragment>
        <button
          type={type}
          disabled={disabled}
          title={title}
          onClick={this.onClick}
          className={classNames({
            'iconOnly': this.hasOnlyOneRealReactElementChild(children),
            'floatRight': floatRight === true,
            'primary': primary === true
          })}
        >
          {children}
        </button>

        <style jsx>{`
          button {
            color: ${colors.whiteAlpha50};
            text-transform: uppercase;
            font-size: ${fontSizes.tiny};
            padding: ${spacings.tiny} ${spacings.small};
            border-radius: ${spacings.radiusTiny};
            background: ${colors.grayAlpha60};
            border: 1px solid ${colors.whiteAlpha15};
            outline: none;
            transition: all .5s ease;
          }

          button[disabled],
          button[disabled]:hover {
            color: ${colors.whiteAlpha15};
            border: 1px solid ${colors.grayAlpha40};
            background: ${colors.grayAlpha20};
            cursor: inherit;
          }

          button:hover,
          button:focus {
            color: ${colors.gray};
            background: ${colors.whiteAlpha50};
            border: 1px solid ${colors.whiteAlpha40};
          }

          button > :global(svg) {
            transform: scale(.8);
          }

          button > :global(svg) > :global(g) > :global(path) {
            transition: fill .3s ease;
          }

          button:hover > :global(svg) > :global(g) > :global(path),
          button:focus > :global(svg) > :global(g) > :global(path) {
            fill: ${colors.gray};
          }
          button[disabled]:hover > :global(svg) > :global(g) > :global(path),
          button[disabled]:focus > :global(svg) > :global(g) > :global(path) {
            fill: ${colors.grayLight};
          }

          button:focus {
            box-shadow: inset ${colors.focusShadow} 0 0 ${spacings.focusShadow};
          }

          .iconOnly {
            height: ${spacings.grande};
            padding: 0;
          }

          .primary {
            font-size: ${fontSizes.small};
            padding: ${spacings.small} ${spacings.base};
          }

          .floatRight {
            float: right;
          }
        `}</style>
      </Fragment>
    )
  }
}