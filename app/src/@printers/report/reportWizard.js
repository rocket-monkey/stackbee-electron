import { PureComponent, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'class-names'
import FieldSet from '@core/form/fieldSet'
import Form from '@core/form'
import DatePicker from '@core/form/datePicker'
import { colors, spacings, fontSizes } from '@styles'

class ReportCreator extends PureComponent {
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

        <Form>
          {(isValid, loading, resetForm, getFieldRef) => (
            <Fragment sideBySide>
              <FieldSet>
                <DatePicker name="fromDate" label={<FormattedMessage id='@app.modules.printers.reportCreator.fromDate' defaultMessage='From date' />} />
                <DatePicker name="toDate" label={<FormattedMessage id='@app.modules.printers.reportCreator.toDate' defaultMessage='To date' />} />
              </FieldSet>
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