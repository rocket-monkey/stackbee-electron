import { Component, Fragment } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import { FormattedMessage } from 'react-intl'
import classNames from 'class-names'
import NoSSR from 'react-no-ssr'
import Button from '@core/button'
import Loading from '@core/loading'
import Input from '@core/form/input'
import Logo from '@core/logo'
import StackbeeAPI from '@api'

const isDev = require('electron-is-dev')
let api = null

export default observer(
class LoginRequired extends Component {
  state = {
    visible: false,
    error: false,
    success: false
  }

  errorTimer = null

  constructor(props) {
    super(props)
    this.usernameRef = React.createRef()
    this.passwordRef = React.createRef()
  }

  handleSubmit = (event) => {
    event.preventDefault()
    const { error, success } = this.state
    if (error || success) {
      console.info('LoginRequired: already in error or success state - abort!')
      return
    }

    console.log('LoginRequired: fetch /authenticate endpoint')

    api
      .post('/authenticate', {
        name: this.usernameRef.current.getValue(),
        password: this.passwordRef.current.getValue()
      })
      .then(res => res.json && res.json() || res)
      .then(json => {
        if (json.success) {
          // login attempt successful, save token
          const auth = {
            user: this.usernameRef.current.getValue(),
            token: json.token
          }

          this.setState({ success: true  })
          setTimeout(() => {
            this.setState({ success: false })
            setTimeout(() => {
              localStorage.setItem('auth', JSON.stringify(auth))
              action(() => {
                this.props.appState.auth = auth
              })()
            }, 300)
          }, 1000)
        } else {
          // login attempt failed, show error
          this.setState({ error: true })
          clearTimeout(this.errorTimer)
          this.errorTimer = setTimeout(() => {
            this.setState({ error: false  })
          }, 2500)
        }
      })
  }

  componentDidMount() {
    const auth = typeof localStorage !== 'undefined' && (JSON.parse(localStorage.getItem('auth')) || {}) || {}
    setTimeout(action(() => {
      this.props.appState.auth = auth
      api = new StackbeeAPI(isDev, this.props.appState)
      this.setState({ visible: true })
    }), 50)
  }

  render() {
    const { children, appState } = this.props
    const { visible, error, success } = this.state
    const isLoggedIn = Object.keys(appState.auth).length > 0

    if (!visible) {
      return <Loading />
    }

    if (!isLoggedIn) {
      return (
        <NoSSR>
          <Logo />

          <h2>Login</h2>

          <form onSubmit={this.handleSubmit.bind(this)}>
            <Input type="text" name="username" autoFocus label={<FormattedMessage id='@app.login.username' defaultMessage='Username' />} ref={this.usernameRef} disabled={success} />
            <Input type="password" name="password" label={<FormattedMessage id='@app.login.password' defaultMessage='Password' />} ref={this.passwordRef} disabled={success} />

            <Button type="submit" primary floatRight disabled={error || success}>
              <FormattedMessage id='@app.login.submit' defaultMessage='Login' />
            </Button>

            <div className={classNames('errorPane', { 'paneActive': this.state.error })}>
              <FormattedMessage id='@app.login.error' defaultMessage='Login attempt failed' />
            </div>

            <div className={classNames('successPane', { 'paneActive': this.state.success })}>
              <FormattedMessage id='@app.login.success' defaultMessage='Logged in successful!' />
            </div>
          </form>

          <style jsx>{`
            h2 {
              width: 50%;
              max-width: 500px;
              min-width: 300px;
              margin: 0 auto 18px auto;
              padding: 6px;
              border-radius: 5px;
              background: rgba(0, 0, 0, .25);
              text-align: center;
              text-transform: lowercase;
            }

            form {
              width: 50%;
              max-width: 500px;
              min-width: 300px;
              margin: 0 auto;
              position: relative;
              padding-bottom: 29px;
            }

            button {
              float: right;
            }

            .errorPane,
            .successPane {
              position: absolute;
              bottom: 0;
              left: 0;
              color: rgba(255, 255, 255, .7);
              opacity: 0;
              pointer-events: none;
              border-radius: 3px;
              padding: 6px 9px;
              border: 1px solid rgba(255, 255, 255, .15);
              box-shadow: inset rgba(255, 25, 251, .9) 0 0 3px;
              text-transform: uppercase;
              font-size: .75rem;
              background: rgba(255, 94, 86, .5);
              transition: opacity .3s ease, transform .5s ease;
              transform: translateY(50%) rotateZ(6deg);
            }

            .successPane {
              box-shadow: inset rgba(201, 255, 83, .9) 0 0 3px;
              background: rgba(44, 167, 43, .5);
            }

            .paneActive {
              opacity: 1;
              transform: translateY(0%);
            }
          `}</style>
        </NoSSR>
      )
    }

    return (
      <NoSSR>
        {isLoggedIn && children}
      </NoSSR>
    )
  }
})
