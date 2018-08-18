import { Fragment } from 'react'
import Button from '@core/button'

const LanguageSwitcher = ({ languages, currentLang, updateGlobals }) => {
  const langs = languages.concat('en')
  return (
    <div>
      {langs.map((lang, index) => {
        const isActive = lang === currentLang
        const isLast = index === langs.length - 1
        return (
          <Fragment key={`lang-swticher-${lang}`}>
            <Button disabled={isActive} onClick={() => updateGlobals({ locale: lang }) }>{lang}</Button>
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
          height: 22px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}

export default LanguageSwitcher
