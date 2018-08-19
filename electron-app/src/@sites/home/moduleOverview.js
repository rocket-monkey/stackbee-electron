import { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import Link from 'next/link'
import jwtDecode from 'jwt-decode'
import WithFetch from '@decorators/withFetch'
import PrinterParse from '@printers/parse'
import Alert from '@core/alert'
import { LogoSmall } from '@core/logo'
import IconBookBookmarkLiteratureReadSchool from '@icons/IconBookBookmarkLiteratureReadSchool'
import IconArrowCloudNetworkUpUpload from '@icons/IconArrowCloudNetworkUpUpload'
import { colors, spacings, fontSizes } from '@styles'

class ModuleOverview extends Component {

  constructor(props) {
    super(props)

    this.renderModuleIcon = this.renderModuleIcon.bind(this)
    this.renderModuleText = this.renderModuleText.bind(this)
  }

  renderModuleText(module) {
    switch (module) {
      case 'printers':
        return <FormattedMessage id='@app.modules.printers' defaultMessage='Printer Mgmt' />
      case 'owncloud':
        return <FormattedMessage id='@app.modules.owncloud' defaultMessage='Nextcloud' />
    }
  }

  renderModuleIcon(module) {
    switch (module) {
      case 'printers':
        return <IconBookBookmarkLiteratureReadSchool />
      case 'owncloud':
        return <IconArrowCloudNetworkUpUpload />
    }
  }

  render() {
    const { loading, error, data } = this.props

    if (loading && !error) {
      return null
    }

    const hasError = !data || !data.modules || error

    return (
      <div>
        <h2>
          <FormattedMessage id='@app.moduleOverview.title' defaultMessage='Modules overview' />
          <LogoSmall />
        </h2>

        {!hasError && <div className="container">
          {data.modules.map((module, index) => (
            <div className="module" key={`module-${index}`}>
              <Link href={`/module?module=${module}`}>
                <a>
                  {this.renderModuleIcon(module)}
                  {this.renderModuleText(module)}
                </a>
              </Link>
            </div>
          ))}
        </div>}

        {hasError && <Alert type="error"><FormattedMessage id='@app.error' defaultMessage='Error ocurred!' /></Alert>}

        <style jsx>{`
          h2 {
            overflow: hidden;
          }

          .container {
            display: flex;
          }

          .module {
            flex: 0 1 calc(50% - 4px);
            margin-right: 8px;
          }

          .module > :global(a) {
            display: block;
            border-radius: ${spacings.radiusSmall};
            line-height: ${spacings.grande};
            color: ${colors.bright};
            font-size: ${fontSizes.big};
            text-align: center;
            text-transform: uppercase;
            padding: 66px ${spacings.medium} ${spacings.big};
            background: ${colors.grayLight};
            border: 1px solid ${colors.gray};
            position: relative;
          }

          .module > :global(a:hover) {
            box-shadow: inset ${colors.focusShadow} 0 0 ${spacings.focusShadow};
          }

          .module:nth-child(2) {
            margin-right: 0;
          }

          .module :global(svg) {
            transform-origin: top center;
            position: absolute;
            top: ${spacings.base};
            left: 50%;
            transform: translateX(-50%) scale(1.9);
          }
        `}</style>
      </div>
    )
  }
}

export default WithFetch({
  endpoint: '/modules'
})(ModuleOverview)
