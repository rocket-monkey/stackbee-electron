import React, { Component } from 'react'
import { colors, spacings, fontSizes } from '@styles'
import StackbeeAPI from '@api'
import Button from '@core/button'
import { isVideo } from '../../helpers'
import Video from '../video'
import Image from '../image'

const isDev = require('electron-is-dev')

export default class Selection extends Component {
  ref = React.createRef()
  api = new StackbeeAPI(isDev, this.props.appState)

  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.moveSelection = this.moveSelection.bind(this)
  }

  handleClick = (e, selected) => {
    this.props.addSelection(selected)
  }

  moveSelection = (e) => {
    const fs = fs || require('fs')
    const { selected, selectionPath, folderPath } = this.props
    selected.forEach((s, idx) => {
      const isLast = idx === selected.length - 1
      fs.copyFile(`${selectionPath}/${s}`, `${folderPath}/${s}`, (err) => {
        if (err) throw err
        console.log(`File ${selectionPath}/${s} copied to ${folderPath}/${s}`)
        if (isLast) {
          this.api
            .post('/copyTaggerFiles', {
              fromPath: selectionPath,
              toPath: folderPath,
              files: selected
            })
            .then(res => res.json && res.json() || {})
            .then(json => {
              location.reload()
            })
        }
      })
    })
  }

  componentDidUpdate() {
    this.ref.current.scrollTo(0, this.ref.current.scrollHeight)
  }

  renderMedia = (name) => {
    const { folderPath } = this.props

    const injectedProps = {

    }

    if (isVideo(name)) {
      return <Video src={`file:///${folderPath}/${name}`} alt='' {...injectedProps} />
    }

    return <Image src={`file:///${folderPath}/${name}`} alt='' {...injectedProps} />
  }

  render () {
    const { selected, selectionPath, folderPath } = this.props

    let actualSelected = selected
    let canMoveHere = false
    if (folderPath !== selectionPath && selected.length) {
      actualSelected = []
      canMoveHere = true
    }

    return (
      <div>
        <ul ref={this.ref}>
          {actualSelected.map((s, idx) => {
            return (
              <li
                key={`tag-${idx}`}
                onClick={(e) => this.handleClick(e, s)}
              >
                {this.renderMedia(s)}
              </li>
            )
          })}
          {canMoveHere && <li><Button primary onClick={() => this.moveSelection()}>Move Here!</Button></li>}
        </ul>
        <style jsx>{`
          div {
            position: fixed;
            top: 44px;
            right: 260px;
          }

          ul {
            opacity: .8;
            background: ${colors.blueTurky};
            padding: 0;
            max-height: calc(100vh - 182px);
            overflow-y: auto;
          }

          li {
            list-style: none;
            margin: 0;
            padding: 0;
            max-width: 230px;
          }

          li :global(img) {
            max-width: 100%;
          }

          li :global(video) {
            max-width: 100%;
          }
        `}</style>
      </div>
    )
  }
}
