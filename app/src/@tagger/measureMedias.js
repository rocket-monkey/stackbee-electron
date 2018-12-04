import React, { Component } from 'react'
import StackbeeAPI from '@api'
import { isVideo, isImage } from './helpers'

const isDev = require('electron-is-dev')

let attempts = 0
let timer = null
const waitForSize = (node, cb) => {
  if (attempts >= 50) {
    cb(null)
  }

  if (!node.offsetHeight > 0) {
    attempts++
    clearTimeout(timer)
    timer = setTimeout(waitForSize, 100)
    return
  }

  cb(node)
}

export default class MeasureMedias extends Component {
  state = {
    media: null,
    medias: this.props.medias || [],
    finalData: []
  }
  ref = React.createRef()
  api = new StackbeeAPI(isDev, this.props.appState)

  constructor(props) {
    super(props)

    this.handleOnLoad = this.handleOnLoad.bind(this)
    this.handleVideoOnLoad = this.handleVideoOnLoad.bind(this)
  }

  componentDidMount() {
    if (!this.state.media) {
      let lastOne = this.state.medias.pop()
      while (!isVideo(lastOne) && !isImage(lastOne)) {
        lastOne = this.state.medias.pop()
      }
      this.setState({ media: lastOne })
    }
  }

  handleVideoOnLoad (e) {
    setTimeout(this.handleOnLoad, 2000)
  }

  goToNext = () => {
    const { medias } = this.state
    if (medias.length > 1) {
      const lastOne = medias.pop()
      if (!isVideo(lastOne) && !isImage(lastOne)) {
        return this.goToNext()
      }
      this.setState({ media: lastOne, medias })
    } else {
      console.log('wtf', this.state)
    }
  }

  handleOnLoad () {
    const { media } = this.state
    const { finalData } = this.state
    const mediaNode = this.ref.current.childNodes[0]
    attempts = 0
    waitForSize(mediaNode, (node) => {
      if (node) {
        finalData.push({
          name: media,
          width: node.offsetWidth,
          height: node.offsetHeight
        })
      } else {
        console.warn('Could not load media!', media)
      }

      if (this.state.medias.length > 1) {
        this.goToNext()
      } else {
        console.warn('REACHED THE END!', this.state.finalData.length)
        this.api
          .post('/taggerFolder', {
            folderPath: this.props.folderPath,
            files: this.state.finalData,
            alreadyExists: this.props.alreadyExists
          })
          .then(res => res.json && res.json() || {})
          .then(json => location.reload())
      }
    })
  }

  render () {
    const { folderPath } = this.props
    const { media } = this.state

    if (!media) {
      return null
    }

    let mediaJsx = (
      <img src={`file:///${folderPath}/${media}`} alt='' onLoad={this.handleOnLoad} />
    )
    if (isVideo(media)) {
      mediaJsx = (
        <video
          src={`file:///${folderPath}/${media}`} controls={false} muted
          onLoadStart={this.handleVideoOnLoad}
        />
      )
    }

    return (
      <div ref={this.ref}>
        {mediaJsx}
      </div>
    )
  }
}
