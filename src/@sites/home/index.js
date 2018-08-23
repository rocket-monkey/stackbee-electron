import { Component } from 'react'
import LoginRequired from '@core/loginRequired'
import ModuleOverview from './moduleOverview'

export default class Home extends Component {
  render () {
    const { appState } = this.props
    return (
      <LoginRequired appState={appState}>
        <ModuleOverview appState={appState} />
      </LoginRequired>
    )
  }
}
