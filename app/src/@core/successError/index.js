import { PureComponent, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'class-names'
import { colors, spacings, fontSizes } from '@styles'

export default class SuccessError extends PureComponent {
  render() {
    const { error, success } = this.props
    return (
      <Fragment>
        <div className={classNames('errorPane', { 'paneActive': error })}>
          <FormattedMessage id='@app.login.error' defaultMessage='Login attempt failed' />
        </div>

        <div className={classNames('successPane', { 'paneActive': success })}>
          <FormattedMessage id='@app.login.success' defaultMessage='Logged in successful!' />
        </div>

        <style jsx>{`
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
      </Fragment>
    )
  }
}
