import React, { PureComponent } from 'react'
import { colors, spacings, fontSizes } from '@styles'

export default class Video extends PureComponent {
  videoRef = React.createRef()

  constructor(props) {
    super(props)

    this.handleOnLoad = this.handleOnLoad.bind(this)
  }

  handleOnLoad () {
    this.videoRef.current.play()
  }

  render () {
    const { noControls = true, ...restProps } = this.props

    return (
      <video
        {...restProps}
        ref={this.videoRef}
        onLoadStart={() => {
          setTimeout(() => {
            this.handleOnLoad()
          }, 265)
        }}
        onEnded={() => {
          this.videoRef.current.play()
        }}
        controls={!noControls}
        muted
      />
    )
  }
}
