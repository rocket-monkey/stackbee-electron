import React, { Component } from 'react'
import Link from 'next/link'
import { FormattedMessage } from 'react-intl'
import { colors, spacings, fontSizes } from '@styles'
import Button from '@core/button'
import Form from '@core/form'
import Input from '@core/form/input'
import TagList from './tagList'
import Selection from './selection'
import zIndexes from '../../../@styles/zIndexes';
import { SPECIAL_FILTERS } from '../index'

export default class SideBar extends Component {
  state = {
    tags: this.props.tags || [],
    active: []
  }

  constructor(props) {
    super(props)

    this.unmarkNew = this.unmarkNew.bind(this)
    this.handleTagClick = this.handleTagClick.bind(this)
    this.handleTagRemoval = this.handleTagRemoval.bind(this)
  }

  handleSubmit = (values) => {
    return new Promise((resolve, reject) => {
      const entries = [values.tag]
      const newTags = [...this.state.tags, values.tag]
      this.props.api
        .post('/taggerTags', entries)
        .then(res => res.json && res.json() || {})
        .then(json => {
          this.setState({ tags: newTags })
          resolve(json)
        })
    })
  }

  unmarkNew = () => {
    const { medias } = this.props
    this.props.api
      .post('/taggerUnmarkNew', medias)
      .then(res => res.json && res.json() || {})
      .then(json => {
        location.reload()
      })
  }

  handleTagClick = (active) => {
    this.setState({ active })
    this.props.handleTagClick(active)
  }

  handleTagRemoval = (e) => {
    e.preventDefault()
    const { active } = this.state
    this.props.api
      .post('/taggerKillTags', active)
      .then(res => res.json && res.json() || {})
      .then(json => {
        location.reload()
      })
  }

  render () {
    const { appState, folderPath, selected } = this.props
    const { tags, active } = this.state
    const currentTags = tags || []

    const specials = SPECIAL_FILTERS.map(s => ({ name: s, type: 'special' }))
    const finalTags = [
      ...specials,
      ...currentTags
    ]

    const hasOneFilter = active.length === 1
    const onlyNewFiltered = active.filter(a => a.name === 'new').length && hasOneFilter
    const validSelection = active.filter(a => a.type !== 'special').length

    return (
      <div className="sideBar">
        <div className="title"><i>"{folderPath}" ({this.props.medias.length})</i></div>
        <Button onClick={() => { this.props.updateTaggerState({ activeFolder: null }) }}>Back</Button>
        <Button disabled={!onlyNewFiltered} onClick={this.unmarkNew}>!New</Button>

        <TagList tags={finalTags} medias={this.props.medias} handleTagClick={this.handleTagClick} updateController={this.props.updateController} spreadTag={this.props.spreadTag} matchSpecialFilter={this.props.matchSpecialFilter} api={this.props.api} />
        <Selection appState={appState} folderPath={folderPath} selected={selected} addSelection={this.props.addSelection} selectionPath={this.props.selectionPath} updateTaggerState={this.props.updateTaggerState} />

        <Form onSubmit={this.handleSubmit.bind(this)}>
          {(isValid, loading, resetForm, getFieldRef) => (
            <>
              <Input type="text" name="tag" placeholder="Tag name" />

              <Button type="submit" primary disabled={loading}>+</Button>
              <Button type="submit" primary disabled={!validSelection} onClick={this.handleTagRemoval}>-</Button>
            </>
          )}
        </Form>

        <style jsx>{`
          .sideBar {
            position: fixed;
            top: 60px;
            right: 20px;
            width: 240px;
            min-height: 200px;
            padding: 0 6px;
            z-index: ${zIndexes.top};
            background: ${colors.whiteAlpha15};
          }

          .sideBar :global(form > div) {
            display: inline;
            margin: 0 6px;
          }

          .title {
            text-align: center;
            margin: 0 -6px 4px;
            padding: 6px 0;
            background: ${colors.grayLight};
          }
        `}</style>
      </div>
    )
  }
}
