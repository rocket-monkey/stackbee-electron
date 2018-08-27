import { Component } from 'react'
import classNames from 'class-names'
import { colors, spacings, fontSizes } from '@styles'

class Navi extends Component {
  render() {
    const { navi, active, disabled } = this.props
    return (
      <div className="navi">
        {navi.map((entry, index) => (
          <div
            className={classNames('naviEntry', {
              'active': index === active,
              'disabled': disabled
            })}
            key={`tabs-navi-${index}`}
            onClick={() => {
              !disabled && this.props.setTabsState({ active: index  })
            }}
          >
            {entry[1]}
          </div>
        ))}

        <style jsx>{`
          .navi {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: linear-gradient(${colors.whiteAlpha25}, ${colors.whiteAlpha15});
            box-shadow: inset ${colors.yellowLightAlpha30} 0 1px 3px;
          }

          .disabled {
            cursor: not-allowed !important;
          }

          .naviEntry {
            display: inline-block;
            height: 32px;
            line-height: 32px;
            padding: 0 12px;
            font-size: ${fontSizes.tiny};
            text-transform: uppercase;
            border-right: 1px solid ${colors.yellowLightAlpha30};
            position: relative;
            background: ${colors.grayAlpha20};
            cursor: pointer;
            transition: all .3s ease;
          }
          .naviEntry:not(.active):hover {
            background: ${colors.grayAlpha40};
          }
          .naviEntry:not(.active):hover :global(svg) {
            transform: scale(.75) translateY(-3%);
          }
          .active {
            background: ${colors.gray};
            cursor: default;
          }
        `}</style>
      </div>
    )
  }
}

class Content extends Component {
  render() {
    const { content} = this.props
    return (
      <div className="content">
        {content}
      </div>
    )
  }
}

export default class Tabs extends Component {
  state = {
    active: 0,
    disabled: false
  }

  render() {
    const { children } = this.props
    const { active, disabled } = this.state
    const navi = children.map(tab => [tab.id, tab.title])
    const content = children[active].content(this.setState.bind(this))
    return (
      <div>
        <Content content={content} />
        <Navi navi={navi} active={active} disabled={disabled} setTabsState={this.setState.bind(this)} />
      </div>
    )
  }
}
