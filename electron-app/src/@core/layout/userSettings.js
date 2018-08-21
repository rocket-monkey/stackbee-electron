import { Component  } from 'react'
import { action  } from 'mobx'
import Button from '@core/button'
import spacings from '@styles/spacings'
import zIndexes from '@styles/zIndexes'
import IconActionAvatarProfileUser2 from '@icons/IconActionAvatarProfileUser2'

export default class UserSettings extends Component {
  logout() {
    action(() => {
      this.props.appState.auth = {}
    })()
    localStorage.removeItem('auth')
  }

  render() {
    const { appState} = this.props
    const disabled = !appState.auth.token
    return (
      <div className="logout">
        <Button onClick={this.logout.bind(this)} title={`logout: ${appState.auth.user}`} disabled={disabled}>
          <IconActionAvatarProfileUser2 />
        </Button>
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
