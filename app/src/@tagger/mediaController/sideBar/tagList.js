import React, { Component } from 'react'
import { colors, spacings, fontSizes } from '@styles'
import { SPECIAL_FILTERS } from '../index'

export default class TagList extends Component {
  state = {
    active: []
  }

  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick = (e, tag) => {
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

  render () {
    const { tags } = this.props
    const { active } = this.state

    return (
      <ul>
        {tags.map((tag, idx) => {
          const hasActive = active.filter(a => a.name === tag.name)
          const styleObj = { background: hasActive.length > 0 ? colors.red : 'none' }
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
        <style jsx>{`
          ul {
            margin: 12px 0;
            padding: 6px;
          }

          li {
            list-style: none;
            margin: 0;
            padding: 3px 0;
          }
        `}</style>
      </ul>
    )
  }
}
