import { Component  } from 'react'
import { action  } from 'mobx'
import Button from '@core/button'
import spacings from '@styles/spacings'
import zIndexes from '@styles/zIndexes'
import IconArrowLeftLogoutMove from '@icons/IconArrowLeftLogoutMove'

export default class Logout extends Component {
  logout() {
    action(() => {
      this.props.appState.auth = {}
    })()
    localStorage.removeItem('auth')
  }

  render() {
    const { appState, disabled = false } = this.props
    return (
      <div className="logout">
        <Button onClick={this.logout.bind(this)} title={`logout: ${appState.auth.user}`} disabled={disabled}>
          <IconArrowLeftLogoutMove />
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
