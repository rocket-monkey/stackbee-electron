import { Fragment } from 'react'
import LinkButton from '@core/linkButton'
import IconBuildingEstateHomeHouseReal from '@icons/IconBuildingEstateHomeHouseReal'
import IconProtectRetrictionSecureUnlock from '@icons/IconProtectRetrictionSecureUnlock'

const AdminLink = ({
  isAdminRoute
}) => (
    <div className="linkContainer">
      {isAdminRoute && <LinkButton href="/start" title="back to home"><IconBuildingEstateHomeHouseReal /></LinkButton>}
      {!isAdminRoute && <LinkButton href="/admin" title="admin area"><IconProtectRetrictionSecureUnlock /></LinkButton>}
    <style jsx>{`
      .linkContainer {
        position: absolute;
        top: 6px;
        right: 36px;
        z-index: 100;
      }
    `}</style>
  </div>
)

export default AdminLink
