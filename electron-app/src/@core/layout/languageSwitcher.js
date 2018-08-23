import { Component, Fragment } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import Button from '@core/button'
import { spacings, zIndexes } from '@styles'

class LanguageSwitcher extends Component {
  render() {
    const { appState } = this.props
    if (!appState.langs) {
      return null
    }

    const langs = appState.langs.concat('en')
    return (
      <div>
        {langs.map((lang, index) => {
          const isActive = lang === appState.locale
          const isLast = index === langs.length - 1
          return (
            <Fragment key={`lang-swticher-${lang}`}>
              <Button disabled={isActive} onClick={action(() => {
                appState.locale = lang
              })}>{lang}</Button>
              {
                !isLast &&
                ' | '
              }
            </Fragment>
          )
        })}

        <style jsx>{`
          div {
            position: absolute;
            bottom: -2px;
            right: 32px;
            width: 80px;
            text-align: center;
            z-index: ${zIndexes.high}
          }
        `}</style>
      </div>
    )
  }
}

export default observer(LanguageSwitcher)
