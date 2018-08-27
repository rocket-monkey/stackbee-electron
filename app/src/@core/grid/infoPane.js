import { Component, Fragment } from 'react'
import { fontSizes } from '@styles'

export default class InfoPane extends Component {
  render() {
    const { data, perPage = 0 } = this.props
    const { page = 0, pages = 0, count = 0 } = data || {}

    let displayEnd = page * perPage + perPage
    if (data && displayEnd > data.count) {
      displayEnd = data.count
    }

    return (
      <Fragment>
        <div>
          {page * perPage + 1}&nbsp;-&nbsp;{displayEnd}&nbsp;/&nbsp;<span>{count}</span>
        </div>

        <style jsx>{`
          div {
            line-height: 38px;
            float: right;
            font-size: ${fontSizes.small};
            font-weight: normal;
            text-transform: initial;
            font-style: italic;
          }

          span {
            font-weight: bold;
          }
        `}</style>
      </Fragment>
    )
  }
}
