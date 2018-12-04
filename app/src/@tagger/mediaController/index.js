import React, { Component } from 'react'
import StackbeeAPI from '@api'
import WithFetch from '@decorators/withFetch'
import { colors, spacings, fontSizes } from '@styles'
import { isVideo, stringHash } from '../helpers'
import Media from './media'
import SideBar from './sideBar'

const isDev = require('electron-is-dev')
export const SPECIAL_FILTERS = ['animated', 'untagged', 'new', 'big', 'ultra']

class MediaController extends Component {
  state = {
    filters: [],
    spreadTag: null
  }
  api = new StackbeeAPI(isDev, this.props.appState)

  constructor(props) {
    super(props)

    this.handleTagClick = this.handleTagClick.bind(this)
    this.addTagToMedia = this.addTagToMedia.bind(this)
    this.addSelection = this.addSelection.bind(this)
  }

  addSelection = (mediaName) => {
    const { selected } = this.props
    const exists = selected.filter(k => k === mediaName)
    if (exists.length) {
      const newSelected = selected.filter(k => k !== mediaName)
      this.props.updateTaggerState({ selected: newSelected, selectionPath: this.props.folderPath })
    } else {
      selected.push(mediaName)
      this.props.updateTaggerState({ selected, selectionPath: this.props.folderPath })
    }
  }

  addTagToMedia = (media, tag, cb) => {
    return new Promise((resolve) => {
      const tags = [...media.tags, tag.name]
      this.api
        .post('/taggerFile', {
          _id: media._id,
          tags
        })
        .then(res => res.json && res.json() || {})
        .then(json => resolve(json))
    })
  }

  handleTagClick = (active) => {
    this.setState({ filters: active })
  }

  matchSpecialFilter = (media, filters) => {
    const specialFilters = filters.filter(f => {
      const isSpecial = SPECIAL_FILTERS.filter(s => s === f.name)
      return isSpecial.length
    })

    if (specialFilters.length === 0) {
      return true
    }

    const matches = []
    specialFilters.forEach(f => {
      if (f.name === 'animated') {
        matches.push(isVideo(media.name) || media.name.toLowerCase().indexOf('gif') > -1)
      } else if (f.name === 'untagged') {
        matches.push(media.tags.length === 0)
      } else if (f.name === 'new') {
        matches.push(media.new === true)
      } else if (f.name === 'big') {
        matches.push(media.width > 900)
      } else if (f.name === 'ultra') {
        matches.push(media.width > 1500)
      }
    })
    return matches.filter(m => m === true).length === specialFilters.length
  }

  matchTag = (media, tagFilters) => {
    if (tagFilters.length === 0) {
      return true
    }

    let hasMatch = false
    media.tags.forEach(t => {
      tagFilters.forEach(f => {
        if (t === f.name) {
          hasMatch = true
        }
      })
    })
    return hasMatch
  }

  filterNew = (media, filterNew) => {
    if (!filterNew) {
      return true
    }

    return media.new === true
  }

  matchFilter = (media, filters) => {
    const allTagFilters = filters.filter(f => {
      const isSpecial = SPECIAL_FILTERS.filter(s => s === f.name)
      return !isSpecial.length
    })

    const matchesTag = this.matchTag(media, allTagFilters)
    const matchesSpecial = this.matchSpecialFilter(media, filters)
    return matchesTag && matchesSpecial
  }

  render () {
    const { appState, folderPath, data, tags, selected } = this.props
    const { filters, spreadTag } = this.state

    let docs = data && data.docs || []

    let filteredDocs = docs
    if (filters.length) {
      filteredDocs = docs.filter(d => this.matchFilter(d, filters))
    }

    return (
      <div>
        <div className="medias">
          {filteredDocs.map((doc, idx) => <Media key={idx} folderPath={folderPath} selected={selected} media={doc} addSelection={this.addSelection} addTagToMedia={this.addTagToMedia} spreadTag={spreadTag} />)}
        </div>
        <SideBar appState={appState} folderPath={folderPath} tags={tags} medias={docs} selected={selected} addSelection={this.addSelection} selectionPath={this.props.selectionPath} handleTagClick={this.handleTagClick} api={this.api} updateController={this.setState.bind(this)} updateTaggerState={this.props.updateTaggerState} spreadTag={spreadTag} matchSpecialFilter={this.matchSpecialFilter} />
        <style jsx>{`
          .medias {
            width: calc(100vw - 300px);
            height: calc(100vh - 40px);
            overflow-y: auto;
          }
        `}</style>
      </div>
    )
  }
}

export default WithFetch(({ folderId }) => {
  return {
    endpoint: `/taggerFiles?folderRef=${folderId}`
  }
})(MediaController)