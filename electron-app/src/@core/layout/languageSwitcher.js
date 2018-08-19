import { Fragment } from 'react'
import { action } from 'mobx'
import Button from '@core/button'
import spacings from '@styles/spacings'

const LanguageSwitcher = ({ appState }) => {
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
          bottom: 0;
          right: 0;
          width: 80px;
          height: ${spacings.huge};
          text-align: center;
        }
      `}</style>
    </div>
  )
}

export default LanguageSwitcher
