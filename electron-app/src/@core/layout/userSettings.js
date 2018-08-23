import { Component  } from 'react'
import { defineMessages } from 'react-intl'
import { action  } from 'mobx'
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

export default class UserSettings extends Component {
  logout() {
    action(() => {
      this.props.appState.auth = {}
    })()
    localStorage.removeItem('auth')
  }

  render() {
    const { appState, intl } = this.props
    const disabled = !appState.auth.token
    return (
      <div className="logout">
        <LinkButton href="/userSettings" title={intl.formatMessage(msgs.userSettings)}>
          <IconActionAvatarProfileUser2 />
        </LinkButton>

        {/* <Button onClick={this.logout.bind(this)} title={`logout: ${appState.auth.user}`} disabled={disabled}></Button> */}

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
