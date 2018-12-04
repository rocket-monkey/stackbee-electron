import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import WithFetch from '@decorators/withFetch'
import MeasureMedias from './measureMedias'
import MediaController from './mediaController'
import Button from '@core/button'
import IconFolder from '@icons/Folder'
import { colors, spacings, fontSizes } from '@styles'
import { app } from 'electron'

const SUB_FOLDER_SUPPORT = false
const PER_PAGE = 10

class Tagger extends Component {
  state = {
    activeFolder: null,
    alreadyExists: null,
    folderRef: null,
    selected: [],
    folderPath: null,
    medias: [],
  }

  constructor(props) {
    super(props)

    this.walkSync = this.walkSync.bind(this)
    this.getMedias = this.getMedias.bind(this)
    this.openFolder = this.openFolder.bind(this)
    this.scanFolderAgain = this.scanFolderAgain.bind(this)
    this.activateFolder = this.activateFolder.bind(this)
    this.getFilesOfExistingFolder = this.getFilesOfExistingFolder.bind(this)
  }

  walkSync (dir) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir)

    const filelist = []
    files.forEach(function(file) {
      const isDir = fs.statSync(dir + '/' + file).isDirectory()
      if (isDir && SUB_FOLDER_SUPPORT) {
        filelist = this.walkSync(dir + '/' + file + '/', filelist)
      } else if (!isDir) {
        filelist.push(file)
      }
    })

    return filelist
  }

  getMedias (folderPath, alreadyExists) {
    // TODO: check if folder already exists in mongodb! when open-file dialog again
    const filelist = this.walkSync(folderPath)
    this.setState({ folderPath, medias: filelist, alreadyExists })
  }

  openFolder () {
    const { dialog } = require('electron').remote

    const filters = [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
      { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] }
    ]
    const properties = ['openDirectory']
    dialog.showOpenDialog({ filters, properties }, (fileNames) => {
      if (fileNames === undefined) return
      this.getMedias(fileNames.pop())
     })
  }

  activateFolder = (folder) => {
    this.setState({ activeFolder: folder })
  }

  getFilesOfExistingFolder = (_id) => {
    const { data: { allFiles } } = this.props
    const { alreadyExists } = this.state
    return allFiles.filter(f => f.folderRef === _id)
  }

  scanFolderAgain (e, folder) {
    e.stopPropagation()
    this.setState({ folderRef: folder._id })
    const files = this.getFilesOfExistingFolder(folder._id)
    this.getMedias(folder.path, files)
  }

  render () {
    const { data, appState } = this.props
    const { medias, folderPath, activeFolder, alreadyExists, selected, selectionPath } = this.state

    if (activeFolder) {
      return <MediaController appState={appState} folderPath={activeFolder.path} folderId={activeFolder._id} tags={data && data.tags} selected={selected} selectionPath={selectionPath} updateTaggerState={this.setState.bind(this)} />
    }

    let listFoldersJsx = null
    if (data && data.docs) {
      listFoldersJsx = data.docs.map((folder, idx) => {
        return (
          <li
            key={`folder-${idx}`}
            onClick={() => this.activateFolder(folder)}
          >
            <IconFolder />
            {folder.path}
            {' '}
            <Button onClick={(e) => this.scanFolderAgain(e, folder) }>scan again</Button>
            <style jsx>{`
              li {
                height: 56px;
                list-style: none;
                margin: 0;
                padding: 3px 6px 12px 6px;
                cursor: pointer;
              }

              li:hover {
                background: ${colors.whiteAlpha15};
              }

              li :global(svg) {
                fill: ${colors.yellowAlpha70};
                margin-right: 6px;
                position: relative;
                bottom: -7px;
              }
            `}</style>
          </li>
        )
      })
    }

    if (alreadyExists) {
      const existsStr = alreadyExists.map(ae => ae.name).join('')
      const onlyNewMedias = medias.filter(m => {
        return existsStr.indexOf(m) === -1
      })
      return <MeasureMedias alreadyExists={this.state.folderRef} appState={appState} folderPath={this.state.folderPath} medias={onlyNewMedias} />
    }

    return (
      <div>
        {
          medias.length === 0 &&
          <Button primary onClick={this.openFolder}>New Folder</Button>
        }
        {
          medias.length > 0 &&
          <MeasureMedias appState={appState} folderPath={this.state.folderPath} medias={medias} />
        }

        <ul>
          {listFoldersJsx}
        </ul>

        <style jsx>{`
          ul {
            margin: 12px 0;
            padding: 6px;
          }
        `}</style>
      </div>
    )
  }
}

export default WithFetch(({ page, sort }) => {
  const sortStr = sort && JSON.stringify(sort) || 'null'
  return {
    endpoint: `/taggerFolders?page=${page}&perPage=${PER_PAGE}&sort=${sortStr}`
  }
})(Tagger)
