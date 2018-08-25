import fs from 'fs'
import { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'class-names'
import IconBookBookmarkLiteratureReadSchool from '@icons/IconBookBookmarkLiteratureReadSchool'
import H2Icon from '@core/h2Icon'
import { parse } from 'path';
import Button from '@core/button'
import { analyzeFile, parseData } from './parser'
import { colors, spacings, fontSizes } from '@styles'

const isDev = require('electron-is-dev')

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
        const meta = JSON.parse(localStorage.getItem(fileName)) || analyzeFile(fileName, fs.readFileSync(fileName, 'utf-8'))
        isDev && console.info('fileName', fileName)
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
      const { files } = this.state
      files[fileName].meta.error = false
      this.setState({ isWorking: fileName, files })
      const result = await parseData(fileName, fs.readFileSync(fileName, 'utf-8'), this.props.appState)
      const processed = (result.received && result.received) - (result.failedEntries && result.failedEntries.length)
      if (processed === (result.exists + result.saved)) {
        files[fileName].meta.processed = processed
        files[fileName].meta.failedEntries = result.failedEntries
        this.setState({ isWorking: false, files })
        // localStorage.setItem(fileName, JSON.stringify(files[fileName].meta))
      } else {
        files[fileName].meta.error = true
        this.setState({ isWorking: false, files })
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

      this.tryToParseFiles(fileNames)
    })
  }

  render () {
    const { isWorking, files } = this.state
    const hasNoFiles = files.length === 0

    const filesArr = Object.keys(files).map(key => (
      files[key]
    ))

    for (let i = 0, len = 3; i < len; i++) {
      if (!filesArr[i]) {
        filesArr.push({ skeleton: true })
      }
    }

    return (
      <Fragment>
        <h2>
          <FormattedMessage id='@app.modules.printers.parse' defaultMessage='Parse printer CSV' />
          <H2Icon><IconBookBookmarkLiteratureReadSchool /></H2Icon>
        </h2>

        <Button primary onClick={this.openFile} disabled={isWorking}>
          <FormattedMessage id='@printers.parse.index.open' defaultMessage='Open File' />
        </Button>

        <ul>
          {filesArr.map((file, index) => {
            const { name = '', meta = {} } = file
            const isWorkingThatFile = isWorking === file.name
            const alreadyParsed = typeof meta.processed !== 'undefined'
            const hasProcessed = !isWorkingThatFile && alreadyParsed && meta.processed > 0
            const hasFailed = !isWorkingThatFile && typeof meta.failedEntries !== 'undefined' && meta.failedEntries.length > 0
            let parts = name.split('/')
            if (parts.length === 1) {
              parts = name.split('\\')
            }

            return (
              <li key={index} className={classNames({ 'loading': isWorkingThatFile, 'skeleton': file.skeleton })}>
                <span className="name">{parts.pop()}</span>
                {
                  hasProcessed &&
                  <span className="processed">
                    <FormattedMessage id='@printers.parse.index.processedInfo' defaultMessage='Processed' />: {meta.processed}
                  </span>
                }
                {
                  hasFailed &&
                  <span className="failed">
                    <FormattedMessage id='@printers.parse.index.failedInfo' defaultMessage='Invalid' />: {meta.failedEntries.length}
                  </span>
                }
                {
                  meta.error &&
                  <span className="error">
                    <FormattedMessage id='@printers.parse.index.errorInfo' defaultMessage='Error' />
                  </span>
                }
                {!file.skeleton && <Button
                  floatRight
                  onClick={() => {
                    this.parseFile(name)
                  }}
                  disabled={!meta.valid || isWorking || (alreadyParsed && meta.failedEntries.length === 0)}
                >
                  {meta.valid && <FormattedMessage id='@printers.parse.index.parse' defaultMessage='Parse File' />}
                  {!meta.valid && <FormattedMessage id='@printers.parse.index.invalid' defaultMessage='Invalid' />}
                </Button>}
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
            font-size: ${fontSizes.base};
            margin-bottom: 4px;
            line-height: 1.2rem;
          }

          .skeleton {
            opacity: .25;
            height: 34px;
          }

          .loading {
            opacity: .5;
            cursor: progress;
          }

          .error,
          .failed,
          .processed {
            color: ${colors.bright};
            background: ${colors.blue};
            padding: ${spacings.tiny} ${spacings.small};
            border-radius: ${spacings.radiusTiny};
            margin-left: ${spacings.medium};
            font-size: ${fontSizes.tiny};
            text-transform: uppercase;
            font-style: italic;
          }

          .error {
            color: ${colors.red}
          }

          .failed {
            color: ${colors.yellow}
          }
        `}</style>
      </Fragment>
    )
  }
}
