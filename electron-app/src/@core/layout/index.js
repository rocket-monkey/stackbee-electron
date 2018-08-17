import React, { Component } from 'react'
import Link from 'next/link'
import jwtDecode from 'jwt-decode'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import DragArea from './dragArea'
import AdminLink from './adminLink'
import Content from './content'

export const appState = observable({
  auth: 0
})
export default observer(
class Layout extends Component {
  render () {
    const { children, appState, isAdminRoute } = this.props

    const mappedChildren = React.Children.map(children, child => {
      return React.createElement(child.type, {...child.props, appState: this.props.appState}, child.props.children)
    })

    const decodedJwt = appState.auth.token && jwtDecode(appState.auth.token)
    const isAdmin = decodedJwt && decodedJwt.roles.includes('admin')

    return (
      <div>
        {isAdmin && <AdminLink isAdminRoute={isAdminRoute} />}
        <DragArea />
        <Content children={mappedChildren} />

        <style jsx>{`
          :global(html),
          :global(body) {
            height: calc(100vh - 16px);
          }
          :global(body > div) {
            height: calc(100vh - 16px);
          }
          :global(body *) {
            box-sizing: border-box;
          }

          div {
            height: 100%;
            padding: 18px 12px;
            position: relative;
            color: #ddd;
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
          }
        `}</style>
      </div>
    )
  }
})
