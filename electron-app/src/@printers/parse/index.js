import fs from 'fs'
import { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import IconBookBookmarkLiteratureReadSchool from '@icons/IconBookBookmarkLiteratureReadSchool'
import H2Icon from '@core/h2Icon'
import Button from '@core/button'
import { analyzeFile, parseData } from './parser'
import { colors, spacings, fontSizes } from '@styles'

export default class PrintersParse extends Component {
  state = {
    isWorking: false,
    files: {}
  }

  tryToParseFiles (fileNames) {
    fileNames.forEach((fileName) => {
      const parts = fileName.split('.')
      const extension = parts.pop()
      if (extension === 'xls' || extension === 'html') {
        const meta = analyzeFile(fileName, fs.readFileSync(fileName, 'utf-8'))
        const { files } = this.state
        files[fileName] = {
          name: fileName,
          meta
        }
        this.setState({ files })
      }
    })
  }

  async parseFile (fileName) {
    try {
      this.setState({ isWorking: fileName })
      const { files } = this.state
      const result = await parseData(fileName, fs.readFileSync(fileName, 'utf-8'), this.props.appState)
      if (result.success) {
        files[fileName].meta.processed = result.processed
        this.setState({ isWorking: false, files })
      } else {
        this.setState({ isWorking: false })
      }
    } catch (err) {
      console.error('Error ocurred!', err)
      this.setState({ isWorking: false })
    }
  }

  openFile = () => {
    const { dialog } = require('electron').remote

    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'All files(*.*)' },
        { name: 'All files(*.*)', extensions: [] },
        { name: 'All files(*.*)', extensions: [ '* ' ] },
        { name: 'All files(*.*)', extensions: [ '*.* ' ] },
      ]
    }, fileNames => {
      if (fileNames === undefined) return

      this.setState({ isWorking: true })
      this.tryToParseFiles(fileNames)
      this.setState({ isWorking: false })
    })
  }

  render () {
    const { isWorking, files } = this.state
    const hasNoFiles = files.length === 0

    const filesArr = Object.keys(files).map(key => (
      files[key]
    ))
    return (
      <Fragment>
        <h2>
          <FormattedMessage id='@app.modules.printers' defaultMessage='Printer Mgmt' />
          <H2Icon><IconBookBookmarkLiteratureReadSchool /></H2Icon>
        </h2>
        <Button primary onClick={this.openFile} disabled={isWorking}>
          <FormattedMessage id='@printers.parse.index.open' defaultMessage='Open File' />
        </Button>

        <ul>
          {filesArr.map((file, index) => {
            const { name, meta } = file
            const alreadyParsed = typeof meta.processed !== 'undefined'
            let parts = name.split('/')
            if (parts.length === 1) {
              parts = name.split('\\')
            }

            return (
              <li key={index} className={isWorking === name ? 'loading' : ''}>
                <span className="name">{parts.pop()}</span>
                {
                  meta.processed &&
                  <span className="processed">
                    <FormattedMessage id='@printers.parse.index.processedInfo' defaultMessage='Processed' />: {meta.processed}
                  </span>
                }
                <Button
                  floatRight
                  onClick={() => {
                    this.parseFile(name)
                  }}
                  disabled={!meta.valid || isWorking || alreadyParsed}
                >
                  <FormattedMessage id='@printers.parse.index.parse' defaultMessage='Parse File' />
                </Button>
              </li>
            )
          })}
          {hasNoFiles && <li><center><i><FormattedMessage id='@printers.parse.index.noFilesHint' defaultMessage='Please open printer files first to proceed' /></i></center></li>}
        </ul>

        <style jsx>{`
          ul {
            margin: ${spacings.base} 0;
            padding: 0;
          }

          li {
            list-style: none;
            background: ${colors.blackAlpha25};
            padding: ${spacings.small};
            border-radius: ${spacings.radiusSmall};
            border: 1px solid ${colors.whiteAlpha15};
            font-size: ${fontSizes.medium};
            margin-bottom: 4px;
            line-height: 1.2rem;
          }

          .loading {
            opacity: .5;
          }

          .processed {
            margin-left: ${spacings.medium};
            font-size: ${fontSizes.small};
          }
        `}</style>
      </Fragment>
    )
  }
}
