import React, { Component } from 'react'
import { colors, spacings, fontSizes } from '@styles'
import { SPECIAL_FILTERS } from '../index'
import Button from '@core/button'

export default class TagList extends Component {
  state = {
    active: [],
    filterTags: 'default',
    spreadType: null,
    typeOverride: {}
  }

  constructor(props) {
    super(props)

    this.getType = this.getType.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleFilterClick = this.handleFilterClick.bind(this)
  }

  handleFilterClick = (e, type) => {
    if (e.ctrlKey) {
      const { spreadType } = this.state
      if (!spreadType) {
        this.setState({ spreadType: type })
      } else {
        this.setState({ spreadType: null })
      }
      return
    }

    this.setState({ filterTags: type })
  }

  handleClick = (e, tag) => {
    const { spreadType, typeOverride } = this.state

    if (spreadType) {
      this.props.api
        .post('/taggerTagUpdate', {
          _id: tag._id,
          type: spreadType
        })
        .then(res => res.json && res.json() || {})
        .then(json => {
          typeOverride[tag.name] = spreadType
          this.setState({ typeOverride })
        })
      return
    }

    if (e.ctrlKey && tag.name !== 'animated' && tag.name !== 'untagged' && tag.name !== 'new') {
      if (this.props.spreadTag) {
        return this.props.updateController({ spreadTag: null })
      }

      return this.props.updateController({ spreadTag: tag })
    }

    const { active } = this.state
    const exists = active.filter(a => a.name === tag.name)
    if (exists.length) {
      const without = active.filter(a => a.name !== tag.name)
      this.setState({ active: without })
      this.props.handleTagClick(without)
    } else {
      active.push(tag)
      this.setState({ active })
      this.props.handleTagClick(active)
    }
  }

  getCount = (tag) => {
    const isSpecial = SPECIAL_FILTERS.filter(s => s === tag.name).length > 0
    const { medias } = this.props
    let count = 0
    medias.forEach(m => {
      if (isSpecial) {
        if (this.props.matchSpecialFilter(m, [tag])) {
          count++
        }
      } else {
        m.tags.forEach(mt => {
          if (mt === tag.name) {
            count++
          }
        })
      }
    })
    return count
  }

  getType = (tag) => {
    const { typeOverride } = this.state
    if (typeOverride[tag.name]) {
      return typeOverride[tag.name]
    }

    return tag.type
  }

  render () {
    const { tags } = this.props
    const { active, filterTags, spreadType } = this.state

    let actualTags = tags
    if (filterTags !== 'default') {
      actualTags = tags.filter(t => this.getType(t) === filterTags)
    } else {
      actualTags = tags.filter(t => this.getType(t) === 'default' || t.type === 'special')
    }

    return (
      <div>
        <Button disabled={filterTags === 'default'} onClick={(e) => this.handleFilterClick(e, 'default')}>{spreadType === 'default' ? '_default' : 'default'}</Button>
        <Button disabled={filterTags === 'name'} onClick={(e) => this.handleFilterClick(e, 'name')}>{spreadType === 'name' ? '_names' : 'names'}</Button>
        <ul>
          {actualTags.map((tag, idx) => {
            const hasActive = active.filter(a => a.name === tag.name)
            const isSpecial = SPECIAL_FILTERS.filter(s => s === tag.name).length > 0
            const styleObj = { background: hasActive.length > 0 ? colors.red : 'none', color: isSpecial ? colors.yellowAlpha70 : colors.white }
            const isSpreading = this.props.spreadTag ? this.props.spreadTag.name === tag.name : false
            const count = this.getCount(tag)
            return (
              <li
                key={`tag-${idx}`}
                style={styleObj}
                onClick={(e) => this.handleClick(e, tag)}
              >
                {isSpreading ? `_${tag.name}` : tag.name}
                {` (${count})`}
              </li>
            )
          })}
        </ul>
        <style jsx>{`
          div {
            margin-top: 12px;
          }

          ul {
            margin: 6px 0 12px 0;
            padding: 0;
          }

          li {
            list-style: none;
            margin: 0;
            padding: 3px 6px;
            font-size: 1rem;
            cursor: pointer;
          }

          li:hover {
            background: ${colors.redDark} !important;
          }
        `}</style>
      </div>
    )
  }
}
