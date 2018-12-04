import { PureComponent, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'class-names'
import FieldSet from '@core/form/fieldSet'
import Button from '@core/button'
import Form from '@core/form'
import Input from '@core/form/input'
import DatePicker from '@core/form/datePicker'
import { colors, spacings, fontSizes } from '@styles'

class ReportCreator extends PureComponent {
  state = {
    error: false,
    success: false
  }

  handleSubmit = (values) => {
    return new Promise((resolve, reject) => {
      const { error, success } = this.state
      if (error || success) {
        console.info('ReportCreator: already in error or success state - abort!')
        reject()
        return
      }

      console.log('ReportCreator: filter now')

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

  render() {
    const { active } = this.props

    if (!active) {
      return null
    }

    return (
      <Fragment>
        <span className="title">
          <FormattedMessage id='@app.modules.printers.reportCreator.active' defaultMessage='Create Report:' />
        </span>

        <Form onSubmit={this.handleSubmit.bind(this)}>
          {(isValid, loading, resetForm, getFieldRef) => (
            <Fragment>
              <FieldSet sideBySide>
                <DatePicker name="fromDate" label={<FormattedMessage id='@app.modules.printers.reportCreator.fromDate' defaultMessage='From date' />} disabled={loading} />
                <DatePicker name="toDate" label={<FormattedMessage id='@app.modules.printers.reportCreator.toDate' defaultMessage='To date' />} disabled={loading} />
              </FieldSet>

              <FieldSet sideBySide>
                <Input type="text" name="pattern" isRequired label={<FormattedMessage id='@app.modules.printers.reportCreator.pattern' defaultMessage='Filename Pattern' />} disabled={loading} />
              </FieldSet>

              <Button type="submit" primary disabled={loading}>
                <FormattedMessage id='@app.modules.printers.reportCreator.filter' defaultMessage='Filter' />
              </Button>
            </Fragment>
          )}
        </Form>

        <style jsx>{`
          .title {
            font-size: ${fontSizes.tiny};
            margin-right: ${spacings.base};
          }
        `}</style>
      </Fragment>
    )
  }
}

export default class ReportWizard extends PureComponent {
  handleClick = () => {
    if (!this.props.active) {
      this.props.setActive()
    }
  }

  render() {
    const { active } = this.props
    return (
      <Fragment>
        <div className={classNames('reportCreator', { 'inactive': !active })} onClick={this.handleClick}>
          {!active && <FormattedMessage id='@app.modules.printers.reportCreator.inactive' defaultMessage='+ Create Report' />}
          <ReportCreator active={active} />
        </div>

        <style jsx>{`
          .reportCreator {
            background: ${colors.blackAlpha25};
            padding: ${spacings.small};
            border-radius: ${spacings.radiusSmall};
            border: 1px solid ${colors.whiteAlpha15};
            font-size: ${fontSizes.base};
            margin-top: ${spacings.medium};
            line-height: 1.2rem;
          }

          .inactive {
            cursor: pointer;
          }
        `}</style>
      </Fragment>
    )
  }
}