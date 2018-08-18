import { Component  } from 'react'
import { action  } from 'mobx'
import Button from '@core/button'
import IconArrowLeftLogoutMove from '@icons/IconArrowLeftLogoutMove'

export default class Logout extends Component {
  logout() {
    action(() => {
      this.props.appState.auth = {}
    })()
    localStorage.removeItem('auth')
  }

  render() {
    const { appState } = this.props
    return (
      <div className="logout">
        <Button onClick={this.logout.bind(this)} title={`logout: ${appState.auth.user}`}>
          <IconArrowLeftLogoutMove />
        </Button>
        <style jsx>{`
          div {
            position: absolute;
            top: 6px;
            right: 0;
            z-index: 100;
          }
        `}</style>
      </div>
    )
  }
}
