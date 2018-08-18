import React, { Component, Fragment } from 'react'
import classNames from 'class-names'

export default class Button extends Component {

  onClick(event) {
    const { onClick } = this.props
    if (onClick) {
      onClick(event)
    }
  }

  render() {
    const { type = 'submit', primary, floatRight, disabled, title, children } = this.props
    let childType = children.type || ''
    if (typeof childType === 'function') {
      childType = children.type.toString()
    }

    return (
      <Fragment>
        <button
          type={type}
          disabled={disabled}
          title={title}
          onClick={this.onClick.bind(this)}
          className={classNames({
            'iconOnly': childType.includes('Icon') && React.Children.count(children) === 1,
            'floatRight': floatRight === true,
            'primary': primary === true
          })}
        >
          {children}
        </button>

        <style jsx>{`
          button {
            color: rgba(255, 255, 255, .5);
            text-transform: uppercase;
            font-size: .65rem;
            padding: 3px 6px;
            border-radius: 3px;
            background: rgba(33,33,33, .6);
            border: 1px solid rgba(255, 255, 255, .1);
            outline: none;
            transition: all .5s ease;
          }

          button[disabled] {
            color: rgba(255, 255, 255, .1);
            border: 1px solid rgba(33, 33, 33, .4);
            background: rgba(33,33,33, .2);
          }

          button:hover,
          button:focus {
            color: #333;
            background: rgba(255,255,255, .6);
            border: 1px solid rgba(255, 255, 255, .4);
          }

          button > :global(svg) {
            transform: scale(.8);
          }

          button > :global(svg) > :global(g) > :global(path) {
            transition: fill .3s ease;
          }

          button:hover > :global(svg) > :global(g) > :global(path),
          button:focus > :global(svg) > :global(g) > :global(path) {
            fill: #333;
          }

          button:focus {
            box-shadow: inset rgba(35, 128, 251, .9) 0 0 8px;
          }

          .iconOnly {
            height: 32px;
            padding: 0;
          }

          .primary {
            font-size: .75rem;
            padding: 6px 9px;
          }

          .floatRight {
            float: right;
          }
        `}</style>
      </Fragment>
    )
  }
}