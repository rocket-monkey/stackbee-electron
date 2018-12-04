import { Component } from 'react'
import LoginRequired from '@core/loginRequired'
import H2Icon from '@core/h2Icon'
import LinkButton from '@core/linkButton'
import IconEyeReadSeeView from '@icons/IconEyeReadSeeView'
import IconProtectRetrictionSecureUnlock from '@icons/IconProtectRetrictionSecureUnlock'

export default class Admin extends Component {
  render() {
    const { globals, renderGlobals, appState } = this.props
    return (
      <LoginRequired appState={appState}>
        <h2>
          Admin Area
          <H2Icon><IconProtectRetrictionSecureUnlock /></H2Icon>
        </h2>

        <LinkButton href="/photoTagger"><IconEyeReadSeeView /></LinkButton>
      </LoginRequired>
    )
  }
}
