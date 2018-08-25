import React, { Component, Fragment } from 'react'
import Link from 'next/link'
import classNames from 'class-names'
import { colors, spacings, fontSizes } from '@styles'

export default class LinkButton extends Component {
  hasOnlyOneRealReactElementChild = (children) => {
    if (!children) {
      return false
    }

    const count = React.Children.count(children)
    return React.isValidElement(children[0]) && count === 1
  }

  onClick = (event) => {
    const { onClick  } = this.props
    if (onClick) {
      onClick(event)
    }
  }

  render() {
    const { href, primary, floatRight, disabled, title, children } = this.props
    return (
      <div
        title={title}
        onClick={this.onClick.bind(this)}
        className={classNames('link', {
          'iconOnly': this.hasOnlyOneRealReactElementChild(children),
          'floatRight': floatRight === true,
          'primary': primary === true
        })}
      >
        <Link href={href}>{children}</Link>

        <style jsx>{`
          .link,
          .link > :global(a) {
            color: ${colors.whiteAlpha50};
            text-transform: uppercase;
            font-size: ${fontSizes.tiny};
            padding: ${spacings.tiny} ${spacings.small};
            border-radius: ${spacings.radiusTiny};
            background: ${colors.grayAlpha60};
            border: 1px solid ${colors.whiteAlpha15};
            outline: none;
            transition: all .5s ease;
            cursor: pointer;
          }

          .link:hover,
          .link:focus,
          .link > :global(a:hover),
          .link > :global(a:focus) {
            color: ${colors.gray};
            background: ${colors.whiteAlpha50};
            border: 1px solid ${colors.whiteAlpha40};
          }

          .link:focus,
          .link > :global(a:focus) {
            box-shadow: inset ${colors.focusShadow} 0 0 ${spacings.focusShadow};
          }

          .link > :global(svg) {
            transform: scale(.8);
          }

          .link > :global(svg) > :global(g) > :global(path) {
            transition: fill .3s ease;
          }

          .link:hover > :global(svg) > :global(g) > :global(path),
          .link:focus > :global(svg) > :global(g) > :global(path) {
            fill: ${colors.gray};
          }

          .iconOnly {
            height: ${spacings.grande};
            padding: 0;
          }

          .primary > :global(a) {
            font-size: ${fontSizes.small};
            padding: ${spacings.small} ${spacings.base};
          }

          .floatRight > :global(a) {
            float: right;
          }
        `}</style>
      </div>
    )
  }
}