import React, { Component } from 'react'
import { compose } from 'recompose'
import { injectIntl } from 'react-intl'
import Link from 'next/link'
import jwtDecode from 'jwt-decode'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import WithIntl from '@decorators/withIntl'
import DragArea from './dragArea'
import AdminLink from './adminLink'
import UserSettings from './userSettings'
import OfflineBadge from './offlineBadge'
import Content from './content'
import { colors, spacings, fontSizes, zIndexes } from '@styles'

export const appState = observable({
  online: true,
  locale: 'en',
  langs: null,
  auth: {}
})

class Layout extends Component {
  render () {
    const { children, appState, isAdminRoute, intl } = this.props

    const mappedChildren = React.Children.map(children, child => {
      return React.createElement(child.type, {...child.props, appState: this.props.appState}, child.props.children)
    })

    const decodedJwt = appState.auth.token && jwtDecode(appState.auth.token)
    const isAdmin = decodedJwt && decodedJwt.roles.includes('admin')

    return (
      <div>
        <OfflineBadge appState={appState} />
        <UserSettings appState={appState} intl={intl} />
        {isAdmin && <AdminLink isAdminRoute={isAdminRoute} />}
        <DragArea />
        <Content appState={appState} children={mappedChildren} />

        <style jsx>{`
          :global(html),
          :global(body) {
            height: calc(100vh - 16px);
          }
          :global(#__next),
          :global(#__next-error) {
            height: calc(100vh - 16px);
          }
          :global(#__next-error) {
            position: absolute;
            top: 24px;
            z-index: ${zIndexes.below};
          }
          :global(body *) {
            box-sizing: border-box;
          }
          :global(a) {
            color: white;
            text-decoration: none;
          }
          :global(h2) {
            width: 50%;
            max-width: 500px;
            min-width: 300px;
            margin: 0 auto ${spacings.big} auto;
            padding: ${spacings.small};
            border-radius: ${spacings.radiusSmall};
            background: ${colors.blackAlpha25};
            text-align: center;
            text-transform: lowercase;
            font-size: ${fontSizes.medium};
            position: relative;
            top: -10px;
          }

          div {
            height: 100%;
            padding: ${spacings.big} ${spacings.medium};
            position: relative;
            color: ${colors.content};
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
          }
        `}</style>
      </div>
    )
  }
}

export default compose(
  WithIntl,
  injectIntl,
  observer
)(Layout)
