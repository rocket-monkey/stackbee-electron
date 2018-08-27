import { Component, Fragment } from 'react'
import classNames from 'class-names'
import { colors, spacings, fontSizes, zIndexes } from '@styles'

export default class Sortable extends Component {
  render() {
    const { data, field, setSort, loading } = this.props
    const { sort = {} } = data || {}

    const isSorted = sort[field]

    return (
      <Fragment>
        <div
          className={classNames({ 'loading': loading, 'desc': isSorted === 'desc', 'asc': isSorted === 'asc', 'notYet': !isSorted })}
          onClick={() => {
            setSort({ [field]: !isSorted || isSorted === 'desc' ? 'asc' : 'desc' })
          }}
        >
          {isSorted && isSorted === 'asc' && <i className="up" />}
          {isSorted && isSorted === 'desc' && <i className="down" />}
          {!isSorted && <i className="up disabled" />}
        </div>

        <style jsx>{`
          div {
            display: inline-block;
            position: relative;
            top: 2px;
          }

          .asc {
            cursor: s-resize;
          }

          .notYet {
            cursor: n-resize;
          }

          .desc {
            cursor: n-resize;
          }

          .loading {
            cursor: inherit;
          }

          i {
            border: solid ${colors.yellow};
            border-width: 0 2px 2px 0;
            display: inline-block;
            padding: 2px;
            float: right;
          }

          .up {
            transform: rotate(-135deg) translateY(-4px) translateX(2px);
            position: relative;
            left: 4px;
          }

          .down {
            transform: rotate(45deg);
            cursor: n-resize;
          }

          .disabled {
            border-color: ${colors.whiteAlpha35};
          }
        `}</style>
      </Fragment>
    )
  }
}