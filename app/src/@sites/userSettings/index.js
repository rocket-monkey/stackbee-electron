import { Component, Fragment } from 'react'
import { action } from 'mobx'
import { FormattedMessage } from 'react-intl'
import classNames from 'class-names'
import LoginRequired from '@core/loginRequired'
import { LogoSmall } from '@core/logo'
import SuccessError from '@core/successError'
import Button from '@core/button'
import Form from '@core/form'
import Input from '@core/form/input'

export default class UserSettings extends Component {
  state = {
    error: false,
    success: false
  }

  handleSubmit = (values) => {
    console.log('values', values)
    this.setState({ error: true })
  }

  logout = () => {
    action(() => {
      this.props.appState.auth = {}
    })()
    localStorage.removeItem('auth')
  }

  render() {
    const { appState } = this.props
    return (
      <div>
        <LoginRequired appState={appState}>
          <h2>
            <FormattedMessage id='@app.userSettings.title' defaultMessage='User Settings' />
            <LogoSmall />
          </h2>

          <Form onSubmit={this.handleSubmit.bind(this)}>
            {(isValid, loading, resetForm, getFieldRef) => (
              <Fragment>
                <Input type="text" name="username" readOnly label={<FormattedMessage id='@app.userSettings.username' defaultMessage='Username' />} />
                <Input type="password" name="password" isRequired label={<FormattedMessage id='@app.userSettings.password' defaultMessage='Password' />} disabled={loading} />

                <Button type="submit" primary floatRight disabled={loading}>
                  <FormattedMessage id='@app.userSettings.submit' defaultMessage='Save' />
                </Button>

                <SuccessError error={this.state.error} success={this.state.success} />
              </Fragment>
            )}
          </Form>

          <Button onClick={this.logout} title={`logout: ${appState.auth.user}`}>
            <FormattedMessage id='@app.userSettings.logout' defaultMessage='Logout' />
          </Button>
        </LoginRequired>

        <style jsx>{`
          h2 {
            overflow: hidden;
          }
        `}</style>
      </div>
    )
  }
}
