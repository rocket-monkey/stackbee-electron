import { Component, Fragment } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import { FormattedMessage } from 'react-intl'
import classNames from 'class-names'
import NoSSR from 'react-no-ssr'
import Button from '@core/button'
import Loading from '@core/loading'
import Form from '@core/form'
import Input from '@core/form/input'
import Logo from '@core/logo'
import StackbeeAPI from '@api'
import { colors, spacings, fontSizes } from '@styles'

const isDev = require('electron-is-dev')
let api = null

class LoginRequired extends Component {
  state = {
    visible: false,
    error: false,
    success: false
  }

  errorTimer = null

  handleSubmit = (values) => {
    return new Promise((resolve, reject) => {
      const { error, success } = this.state
      if (error || success) {
        console.info('LoginRequired: already in error or success state - abort!')
        reject()
        return
      }

      console.log('LoginRequired: fetch /authenticate endpoint')

      api
        .post('/authenticate', {
          name: values.username,
          password: values.password
        })
        .then(res => res.json && res.json() || res)
        .then(json => {
          if (json.success) { // login attempt successful, save token
            const auth = {
              user: values.username,
              token: json.token
            }

            this.setState({ success: true  })
            setTimeout(() => {
              this.setState({ success: false })
              setTimeout(() => {
                resolve()
                localStorage.setItem('auth', JSON.stringify(auth))
                action(() => {
                  this.props.appState.auth = auth
                })()
              }, 300)
            }, 1000)
          } else { // login attempt failed, show error
            reject()
            this.setState({ error: true })
            clearTimeout(this.errorTimer)
            this.errorTimer = setTimeout(() => {
              this.setState({ error: false  })
            }, 2500)
          }
        })
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
    const offline = !appState.online

    if (!visible) {
      return <Loading />
    }

    if (!isLoggedIn) {
      return (
        <NoSSR>
          <Logo />

          <h2>
            <FormattedMessage id='@app.login.submit' defaultMessage='Login' />
          </h2>

          <div className={classNames({ 'offline': offline })}>
            <Form onSubmit={this.handleSubmit.bind(this)}>
              {(isValid, loading, resetForm, getFieldRef) => (
                <Fragment>
                  <Input type="text" name="username" isRequired autoFocus label={<FormattedMessage id='@app.login.username' defaultMessage='Username' />} disabled={success || loading || offline} />
                  <Input type="password" name="password" isRequired label={<FormattedMessage id='@app.login.password' defaultMessage='Password' />} disabled={success || loading || offline} />

                  <Button type="submit" primary floatRight disabled={error || success || loading || offline}>
                    <FormattedMessage id='@app.login.submit' defaultMessage='Login' />
                  </Button>

                  <div className={classNames('errorPane', { 'paneActive': this.state.error })}>
                    <FormattedMessage id='@app.login.error' defaultMessage='Login attempt failed' />
                  </div>

                  <div className={classNames('successPane', { 'paneActive': this.state.success })}>
                    <FormattedMessage id='@app.login.success' defaultMessage='Logged in successful!' />
                  </div>
                </Fragment>
              )}
            </Form>
          </div>

          <style jsx>{`
            button {
              float: right;
            }

            .offline > :global(form) {
              opacity: .25;
            }

            .errorPane,
            .successPane {
              position: absolute;
              bottom: 0;
              left: 0;
              color: ${colors.bright};
              opacity: 0;
              pointer-events: none;
              border-radius: ${spacings.radiusTiny};
              padding: ${spacings.small} ${spacings.base};
              border: 1px solid ${colors.whiteAlpha15};
              box-shadow: inset ${colors.purple} 0 0 ${spacings.tiny};
              text-transform: uppercase;
              font-size: ${fontSizes.small};
              background: ${colors.redDark};
              transition: opacity .3s ease, transform .5s ease;
              transform: translateY(50%) rotateZ(6deg);
            }

            .successPane {
              box-shadow: inset ${colors.mintGreen} 0 0 3px;
              background: ${colors.green};
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
}

export default observer(LoginRequired)
