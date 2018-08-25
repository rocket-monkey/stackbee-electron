import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Tabs from '@core/tabs'
import IconBookDetailInfoNotebookRead from '@icons/IconBookDetailInfoNotebookRead'
import IconBookBookmarkLiteratureReadSchool from '@icons/IconBookBookmarkLiteratureReadSchool'
import H2Icon from '@core/h2Icon'
import PrintersParse from './parse'
import PrintersReport from './report'

export default class Printers extends Component {
  render() {
    const { appState } = this.props
    return (
      <Tabs
        tabs={[
          {
            id: 0,
            title: (
              <div>
                <FormattedMessage id='@app.printers.tabs.parse' defaultMessage='Parse' />
                <H2Icon small><IconBookBookmarkLiteratureReadSchool /></H2Icon>
              </div>
            ),
            content: <PrintersParse appState={appState} />
          },
          {
            id: 1,
            title: (
              <div>
                <FormattedMessage id='@app.printers.tabs.reports' defaultMessage='Reports' />
                <H2Icon small><IconBookDetailInfoNotebookRead /></H2Icon>
              </div>
            ),
            content: <PrintersReport appState={appState} />
          }
        ]}
      />
    )
  }
}
