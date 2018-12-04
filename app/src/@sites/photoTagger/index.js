import { Component } from 'react'
import LoginRequired from '@core/loginRequired'
import Tagger from '@tagger'

export default class PhotoTagger extends Component {
  render () {
    const { appState } = this.props
    return (
      <LoginRequired appState={appState}>
        <Tagger appState={appState} />
      </LoginRequired>
    )
  }
}
