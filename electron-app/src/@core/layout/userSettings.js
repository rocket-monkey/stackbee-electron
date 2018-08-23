import { Component  } from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import LinkButton from '@core/linkButton'
import spacings from '@styles/spacings'
import zIndexes from '@styles/zIndexes'
import IconActionAvatarProfileUser2 from '@icons/IconActionAvatarProfileUser2'

const msgs = defineMessages({
  userSettings: {
    id: '@app.userSettingsLink.title',
    description: 'Title for userSettings link button.',
    defaultMessage: 'User settings'
  }
})

class UserSettings extends Component {
  render() {
    const { appState, intl } = this.props
    const disabled = !appState.auth.token
    return (
      <div className="logout">
        <LinkButton href="/userSettings" title={intl.formatMessage(msgs.userSettings)}>
          <IconActionAvatarProfileUser2 />
        </LinkButton>

        <style jsx>{`
          div {
            position: absolute;
            top: ${spacings.small};
            right: 0;
            z-index: ${zIndexes.base};
          }
        `}</style>
      </div>
    )
  }
}

export default injectIntl(UserSettings)
