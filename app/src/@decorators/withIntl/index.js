import React, { Component } from 'react'
import { action } from 'mobx'
import { IntlProvider, addLocaleData, injectIntl } from 'react-intl'
import messages from '@lang/messages.json'

// Register React Intl's locale data for the user's locale in the browser. This
// locale data was added to the page by `pages/_document.js`. This only happens
// once, on initial page load in the browser.
if (typeof window !== 'undefined' && window.ReactIntlLocaleData) {
  Object.keys(window.ReactIntlLocaleData).forEach((lang) => {
    addLocaleData(window.ReactIntlLocaleData[lang])
  })
}

export default (Page) => {
  const IntlPage = injectIntl(Page)

  return class PageWithIntl extends Component {
    static async getInitialProps (context) {
      let props
      if (typeof Page.getInitialProps === 'function') {
        props = await Page.getInitialProps(context)
      }

      // Always update the current time on page load/transition because the
      // <IntlProvider> will be a new instance even with pushState routing.
      const now = Date.now()

      return { ...props, now }
    }

    componentDidMount () {
      action(() => {
        this.props.appState.langs = Object.keys(messages)
      })()
    }

    render () {
      const { appState, now, ...props } = this.props
      return (
        <IntlProvider locale={appState.locale} messages={messages[appState.locale]} initialNow={now}>
          <IntlPage appState={appState} {...props} />
        </IntlProvider>
      )
    }
  }
}
