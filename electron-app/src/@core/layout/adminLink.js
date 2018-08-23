import { Fragment } from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { observer } from 'mobx-react'
import jwtDecode from 'jwt-decode'
import LinkButton from '@core/linkButton'
import spacings from '@styles/spacings'
import zIndexes from '@styles/zIndexes'
import IconProtectRetrictionSecureUnlock from '@icons/IconProtectRetrictionSecureUnlock'

const msgs = defineMessages({
  adminArea: {
    id: '@app.adminLink.title',
    description: 'Title for admin link button.',
    defaultMessage: 'Admin area'
  }
})

const AdminLink = ({
  appState,
  isAdminRoute,
  intl
}) => {
  const decodedJwt = appState.auth.token && jwtDecode(appState.auth.token)
  const isAdmin = decodedJwt && decodedJwt.roles.includes('admin')

  if (!isAdmin) {
    return null
  }

  return (
    <div className="linkContainer">
      <LinkButton href="/admin" title={intl.formatMessage(msgs.adminArea)}><IconProtectRetrictionSecureUnlock /></LinkButton>

      <style jsx>{`
        .linkContainer {
          position: absolute;
          top: ${spacings.small};
          right: 36px;
          z-index: ${zIndexes.base};
        }
      `}</style>
    </div>
  )
}

export default injectIntl(observer(AdminLink))
