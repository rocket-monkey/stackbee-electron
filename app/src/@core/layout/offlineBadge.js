import { Component } from 'react'

export default class OfflineBadge extends Component {
  render() {
    if (this.props.appState.online) {
      return null
    }

    return (
      <div>
        <span title="Offline!">🚨</span>
        <style jsx>{`
        div {
          position: absolute;
          bottom: 28px;
          right: 50px;
          cursor: not-allowed;
        }
      `}</style>
      </div>
    )
  }
}
