import React, { Component, Fragment } from 'react'
import { observer } from 'mobx-react'
import { LogoSmall } from '@core/logo'
import LanguageSwitcher from './languageSwitcher'
import { colors, spacings } from '@styles'

class Content extends Component {

  renderChildren = () => (
    React.Children.map(this.props.children, (child, index) => (
      React.createElement(child.type, {
        ...child.props,
        key: `content-child-${index}`,
        appState: this.props.appState,
      }, child.props.children)
    ))
  )

  render () {
    const { appState } = this.props
    return (
      <Fragment>
        {
          appState.langs &&
          <Fragment>
            <LogoSmall sticker />
            <LanguageSwitcher appState={appState} />
          </Fragment>
        }

        {this.renderChildren()}

        <style jsx>{`
          div {
            height: 100%;
            padding: ${spacings.big} ${spacings.medium};
            position: relative;
            color: ${colors.content};
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
          }
        `}</style>
      </Fragment>
    )
  }
}

export default observer(Content)
