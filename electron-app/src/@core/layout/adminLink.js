import { Fragment } from 'react'
import LinkButton from '@core/linkButton'
import spacings from '@styles/spacings'
import zIndexes from '@styles/zIndexes'
import IconProtectRetrictionSecureUnlock from '@icons/IconProtectRetrictionSecureUnlock'

const AdminLink = ({
  isAdminRoute
}) => (
    <div className="linkContainer">
      <LinkButton href="/admin" title="admin area"><IconProtectRetrictionSecureUnlock /></LinkButton>
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

export default AdminLink
