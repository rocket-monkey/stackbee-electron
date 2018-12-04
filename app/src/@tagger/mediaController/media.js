import React, { Component } from 'react'
import { colors, spacings, fontSizes } from '@styles'
import { InView } from 'react-intersection-observer'
import { isVideo } from '../helpers'
import Video from './video'
import Image from './image'
import MetaData from './metaData'

const ONLY_RENDER_PLACEHOLDER = false

export default class Media extends Component {
  state = {
    addedTags: this.props.media.tags || [],
    adjustedSize: null
  }

  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {
    const { media } = this.props
    const availableWidth = document.body.offsetWidth - 358;
    if (media.width > availableWidth) {
      const aspect = (availableWidth * 100) / media.width
      const newHeight = (media.height * aspect) / 100
      const adjustedSize = { width: availableWidth, height: newHeight }
      this.setState({ adjustedSize })
    }
  }

  componentDidUpdate(prevProps) {
    const { media } = this.props
    const availableWidth = document.body.offsetWidth - 358;

    if (media.name !== prevProps.media.name) {
      let adjustedSize = null
      if (media.width > availableWidth) {
        const aspect = (availableWidth * 100) / media.width
        const newHeight = (media.height * aspect) / 100
        adjustedSize = { width: availableWidth, height: newHeight }
      }

      this.setState({ addedTags: this.props.media.tags, adjustedSize })
    }
  }

  handleClick = async (media) => {
    const { spreadTag } = this.props
    const { addedTags } = this.state
    if (spreadTag) {
      const alreadyExists = addedTags.filter(t => t === spreadTag.name)
      if (spreadTag && !alreadyExists.length) {
        const updatedMedia = await this.props.addTagToMedia(media, spreadTag)
        this.setState({ addedTags: updatedMedia.tags })
      }

      return
    }

    return this.props.addSelection(media.name)
  }

  renderMedia = (media) => {
    const { folderPath } = this.props

    const injectedProps = {

    }

    if (isVideo(media.name)) {
      return <Video src={`file:///${folderPath}/${media.name}`} alt='' {...injectedProps} />
    }

    return <Image src={`file:///${folderPath}/${media.name}`} alt='' {...injectedProps} />
  }

  render () {
    const { media, selected } = this.props
    const { addedTags, adjustedSize } = this.state

    return (
      <InView>
        {({ inView, ref }) => {
          const color = inView ? colors.grayLight : colors.red
          const styleObj = {
            background: color,
            width: adjustedSize ? adjustedSize.width : media.width,
            height: adjustedSize ? adjustedSize.height : media.height
          }

          let mediaJsx = null
          if (inView && !ONLY_RENDER_PLACEHOLDER) {
            mediaJsx = this.renderMedia(media)
          }

          const isSelected = selected.filter(k => k === media.name)
          if (isSelected.length > 0) {
            styleObj.borderColor = colors.blueTurky
          }

          return (
          <figure ref={ref} className="mediaContainer" style={styleObj} onClick={() => { this.handleClick(media) }}>
            {mediaJsx}
            <MetaData addedTags={addedTags} />
            <style jsx>{`
              figure {
                box-sizing: content-box;
                position: relative;
                float: left;
                margin-right: 12px;
                margin-bottom: 12px;
                border: 5px solid rgba(255, 255, 255, .0);
              }

              figure :global(img),
              figure :global(video) {
                max-width: 100%;
              }
            `}</style>
          </figure>
        )}}
      </InView>
    )
  }
}
