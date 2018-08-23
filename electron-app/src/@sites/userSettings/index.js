import { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'class-names'
import LoginRequired from '@core/loginRequired'
import { LogoSmall } from '@core/logo'
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
  }

  render() {
    const { appState } = this.props
    return (
      <div>
        <h2>
          <FormattedMessage id='@app.userSettings.title' defaultMessage='User Settings' />
          <LogoSmall />
        </h2>

        <LoginRequired appState={appState}>
          <Form onSubmit={this.handleSubmit.bind(this)}>
            {(isValid, loading, resetForm, getFieldRef) => (
              <Fragment>
                <Input type="text" name="username" readOnly label={<FormattedMessage id='@app.userSettings.username' defaultMessage='Username' />} />
                <Input type="password" name="password" isRequired label={<FormattedMessage id='@app.userSettings.password' defaultMessage='Password' />} disabled={loading} />

                <Button type="submit" primary floatRight disabled={loading}>
                  <FormattedMessage id='@app.userSettings.submit' defaultMessage='Save' />
                </Button>

                <div className={classNames('errorPane', { 'paneActive': this.state.error })}>
                  <FormattedMessage id='@app.userSettings.error' defaultMessage='Could not save user settings!' />
                </div>

                <div className={classNames('successPane', { 'paneActive': this.state.success })}>
                  <FormattedMessage id='@app.userSettings.success' defaultMessage='Logged in successful!' />
                </div>
              </Fragment>
            )}
          </Form>
        </LoginRequired>
      </div>
    )
  }
}
