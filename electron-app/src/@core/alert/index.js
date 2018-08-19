import { FormattedMessage } from 'react-intl'
import { colors, spacings, fontSizes } from '@styles'

const Alert = ({ children, type = 'warning' }) => (
  <article>
    <div className={type}>
      {children}
    </div>

    <style jsx>{`
      article {
        width: 50%;
        min-width: 300px;
        max-width: 500px;
        text-align: center;
        margin: 0 auto 12px auto;
        text-transform: uppercase;
        font-size: ${fontSizes.base};
      }

      article :global(.error),
      article :global(.warning),
      article :global(.success),
      article :global(.info) {
        border-radius: ${spacings.radiusTiny};
        padding: ${spacings.small} ${spacings.medium};
        color: ${colors.bright};
        background: ${colors.red};
        box-shadow: inset ${colors.purple} 0 0 ${spacings.tiny};
      }

      article :global(.warning) {
        background: ${colors.yellow};
        box-shadow: inset ${colors.purple} 0 0 ${spacings.tiny};
      }

      article :global(.info) {
        background: ${colors.blueLight};
        box-shadow: inset ${colors.blueTurky} 0 0 ${spacings.tiny};
      }
    `}</style>
  </article>
)

export const DbConnectionRequired = ({ dbConnected }) => {
  if (dbConnected) return null

  return (
    <Alert type='error'>
      <FormattedMessage id='@app.offline' defaultMessage='You are offline!' />
    </Alert>
  )
}

export default Alert
