import React, { Component, Fragment } from 'react'
import Link from 'next/link'
import classNames from 'class-names'

export default class LinkButton extends Component {

  onClick(event) {
    const { onClick  } = this.props
    if (onClick) {
      onClick(event)
    }
  }

  render() {
    const { href, primary, floatRight, disabled, title, children } = this.props
    let childType = children.type || ''
    if (typeof childType === 'function') {
      childType = children.type.toString()
    }
    return (
      <div
        title={title}
        onClick={this.onClick.bind(this)}
        className={classNames('link', {
          'iconOnly': childType.includes('Icon') && React.Children.count(children) === 1,
          'floatRight': floatRight === true,
          'primary': primary === true
        })}
      >
        <Link href={href}>{children}</Link>

        <style jsx>{`
          .link,
          .link > :global(a) {
            color: rgba(255, 255, 255, .5);
            text-transform: uppercase;
            font-size: .65rem;
            padding: 3px 6px;
            border-radius: 3px;
            background: rgba(33,33,33, .6);
            border: 1px solid rgba(255, 255, 255, .1);
            outline: none;
            transition: all .5s ease;
            cursor: default;
          }

          .link:hover,
          .link:focus,
          .link > :global(a:hover),
          .link > :global(a:focus) {
            color: #333;
            background: rgba(255,255,255, .6);
            border: 1px solid rgba(255, 255, 255, .4);
          }

          .link:focus,
          .link > :global(a:focus) {
            box-shadow: inset rgba(35, 128, 251, .9) 0 0 8px;
          }

          .link > :global(svg) {
            transform: scale(.8);
          }

          .link > :global(svg) > :global(g) > :global(path) {
            transition: fill .3s ease;
          }

          .link:hover > :global(svg) > :global(g) > :global(path),
          .link:focus > :global(svg) > :global(g) > :global(path) {
            fill: #333;
          }

          .iconOnly {
            height: 32px;
            padding: 0;
          }

          .primary > :global(a) {
            font-size: .75rem;
            padding: 6px 9px;
          }

          .floatRight > :global(a) {
            float: right;
          }
        `}</style>
      </div>
    )
  }
}