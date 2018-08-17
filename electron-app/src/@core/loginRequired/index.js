import React, { Component, Fragment } from 'react'
import NoSSR from 'react-no-ssr'
import StackbeeAPI from '@api'
import { stringify } from 'querystring';
import { currentId } from 'async_hooks';

const isDev = require('electron-is-dev')
const api = new StackbeeAPI(isDev)

export default class LoginRequired extends Component {
  constructor(props) {
    super(props)
    this.usernameRef = React.createRef()
    this.passwordRef = React.createRef()
  }

  handleSubmit = (event) => {
    event.preventDefault()
    api
      .post('/authenticate', {
        name: this.usernameRef.current.value,
        password: this.passwordRef.current.value
      })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          // login attempt successful, save token
          const auth = {
            user: this.usernameRef.current.value,
            token: json.token
          }

          localStorage.setItem('auth', JSON.stringify(auth))
        } else {
          // login attempt failed, show error
        }
      })
  }

  render() {
    const { children } = this.props
    const auth = typeof localStorage !== 'undefined' && (JSON.parse(localStorage.getItem('auth')) || {}) || {}
    const isLoggedIn = Object.keys(auth).length > 0

    if (!isLoggedIn) {
      return (
        <NoSSR>
          <h6>Login</h6>
          <form onSubmit={this.handleSubmit}>
            <input type="text" placeholder="username" ref={this.usernameRef} />
            <input type="password" placeholder="password" ref={this.passwordRef} />

            <input type="submit" value="Submit" />
          </form>
        </NoSSR>
      )
    }

    return (
      <NoSSR>
        <h6>Logged in: {auth.user}</h6>
        {isLoggedIn && children}
      </NoSSR>
    )
  }
}
