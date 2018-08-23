import React, { Component } from 'react'
import Link from 'next/link'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import DragArea from './dragArea'
import Content from './content'
import { colors, spacings, fontSizes, zIndexes } from '@styles'

export const appState = observable({
  online: true,
  locale: 'en',
  langs: null,
  auth: {}
})

class Layout extends Component {
  render() {
    const { children, appState, isAdminRoute } = this.props

    const mappedChildren = React.Children.map(children, child => {
      return React.createElement(child.type, { ...child.props, appState: this.props.appState }, child.props.children)
    })

    return (
      <div>
        <DragArea />

        <Content appState={appState} isAdminRoute={isAdminRoute} children={mappedChildren} />

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
            padding: ${spacings.small};
            margin: 0 auto;
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

export default observer(Layout)
