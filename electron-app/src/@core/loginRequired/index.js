import { Component, Fragment } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import { log } from 'util';
import { FormattedMessage } from 'react-intl'
import NoSSR from 'react-no-ssr'
import StackbeeAPI from '@api'

const isDev = require('electron-is-dev')
const api = new StackbeeAPI(isDev)

export default observer(
class LoginRequired extends Component {
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
      .then(res => res.json && res.json() || res)
      .then(json => {
        if (json.success) {
          // login attempt successful, save token
          const auth = {
            user: this.usernameRef.current.value,
            token: json.token
          }

          localStorage.setItem('auth', JSON.stringify(auth))
          action(() => {
            this.props.appState.auth = auth
          })()
        } else {
          // login attempt failed, show error
          console.error('Fucked up')
        }
      })
  }

  logout() {
    action(() => {
      this.props.appState.auth = 0
    })()
    localStorage.removeItem('auth')
  }

  componentDidMount() {
    const auth = typeof localStorage !== 'undefined' && (JSON.parse(localStorage.getItem('auth')) || {}) || {}
    setTimeout(action(() => {
      this.props.appState.auth = auth
    }), 50)
  }

  render() {
    const { children, appState } = this.props
    const isLoggedIn = Object.keys(appState.auth).length > 0

    if (!isLoggedIn) {
      return (
        <NoSSR>
          <h6>Login</h6>
          <form onSubmit={this.handleSubmit.bind(this)}>
            <input type="text" placeholder="username" ref={this.usernameRef} />
            <input type="password" placeholder="password" ref={this.passwordRef} />

            <button type="submit">
              <FormattedMessage id='@app.login.submit' defaultMessage='Submit' />
            </button>
          </form>
        </NoSSR>
      )
    }

    return (
      <NoSSR>
        <h6>
          Logged in: {appState.auth.user}&nbsp;
          <button type="submit" onClick={this.logout.bind(this)}>
            <FormattedMessage id='@app.logout.submit' defaultMessage='Logout' />
          </button>
        </h6>
        {isLoggedIn && children}
      </NoSSR>
    )
  }
})
