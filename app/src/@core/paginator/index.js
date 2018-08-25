import { Component, Fragment } from 'react'
import classNames from 'class-names'
import { colors, spacings } from '@styles'

const VISIBLE_PAGES = 5

let lastKeyCode = null

export default class Paginator extends Component {
  constructor(props) {
    super(props)

    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  prev() {
    const { loading, data, setPage } = this.props
    if (loading) {
      return
    }

    const { page = 0, pages = 0 } = data || {}
    const newPage = page > 0 && page - 1
    page > 0 && setPage(newPage)
  }

  next() {
    const { loading, data, setPage } = this.props
    if (loading) {
      return
    }

    const { page = 0, pages = 0 } = data || {}
    const newPage = page + 1 < pages && page + 1
    page + 1 < pages && setPage(newPage)
  }

  setPage(page) {
    const { loading, setPage, resetEdit } = this.props
    if (loading) {
      return
    }

    setPage(page)
    resetEdit()
  }

  onKeyDown(event) {
    const { loading, data, setPage } = this.props
    const { page = 0, pages = 0 } = data || {}
    const { code } = event

    switch (code) {
      case 'ArrowRight':
        if (event.shiftKey) {
          this.next()
        }
        return lastKeyCode = code
      case 'ArrowLeft':
        if (event.shiftKey) {
          this.prev()
        }
        return lastKeyCode = code
      case 'ArrowUp':
        if (event.shiftKey) {
          this.props.bodyRef.scrollTo(0, 0)
        }

        if (event.shiftKey && lastKeyCode === 'ArrowUp') {
          this.props.bodyRef.scrollTo(0, 0)
          this.setPage(0, true)
        }
        return lastKeyCode = code
      case 'ArrowDown':
        if (event.shiftKey) {
          this.props.bodyRef.scrollTo(0, 999999)
        }

        if (event.shiftKey && lastKeyCode === 'ArrowDown') {
          this.props.bodyRef.scrollTo(0, 999999)
          this.setPage(pages, true)
        }
        return lastKeyCode = code
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  render() {
    const { loading, data, setPage} = this.props
    const { page = 0, pages = 0 } = data || {}

    let navi = []
    if (pages > VISIBLE_PAGES) {
      const start = (page > 2 ? page - 1 : 0)
      const offset = page >= VISIBLE_PAGES - 2 ? 2 : 0
      for (let i = start, len = (start + VISIBLE_PAGES); i < len; i++) {
        if (pages - 1 > i) {
          navi.push(i)
        }
      }

      if (navi[navi.length - 1] + 1 !== Math.ceil(pages) - 1) {
        navi.push('..')
      }
      navi.push(Math.ceil(pages) - 1)
    } else {
      for (let i = 0, len = VISIBLE_PAGES; i < len; i++) {
        if (pages >= i) {
          navi.push(i)
        }
      }
    }

    if (navi[0] > 0) {
      navi = [0, '..', ...navi]
      if (navi.length < VISIBLE_PAGES) {
        navi.splice(2, 0, page - 2)
      }
    }

    const filtered = navi.filter(nav => nav === '..')
    if (filtered.length === 2) {
      navi.splice(navi.length - 3, 1)
    }

    const onLastPage = Math.ceil(pages) - 1 === page

    return (
      <Fragment>
        <div className={classNames('paginator', { 'loading': loading })}>
          <div className={classNames('nav', { 'disabled': loading || page === 0 })} onClick={this.prev}>❮</div>
          {navi.map((nav, index) => {
            if (nav === '..') {
              return (
                <div key={`paginator-nav-${index}`} className="separator">..</div>
              )
            }
            return (
              <div
                key={`paginator-nav-${index}`}
                className={classNames('nav', { 'active': nav === page, 'disabled': loading && nav !== page })}
                onClick={() => this.setPage(nav)}
              >{nav + 1}</div>
            )
          })}
          <div className={classNames('nav', { 'disabled': loading || onLastPage })} onClick={this.next}>❯</div>
        </div>

        <style jsx>{`
          .paginator {
            display: inline-block;
            position: relative;
            margin: 6px 0 4px;
            perspective: 620px;
          }

          .nav:first-child:hover {
            transform: translateZ(10px) translateY(-1px);
          }
          .nav:last-child:hover {
            transform: translateZ(10px) translateY(-1px);
          }

          .nav, .separator {
            width: 25px;
            height: 24px;
            display: inline-block;
            padding: ${spacings.small} 0;
            background: ${colors.grayAlpha40};
            margin-right: ${spacings.tiny};
            cursor: pointer;
            text-align: center;
            transition: all .3s ease;
          }

          .disabled {
            color: ${colors.grayLight};
            cursor: inherit;
          }

          .nav:not(.active):focus,
          .nav:not(.active):hover {
            background: ${colors.grayAlpha60};
            box-shadow: ${colors.yellowLight} 0 0 3px;
            transform: translateZ(10px) translateY(-2px);
            transform-style: preserve-3d;
            transform-origin: bottom center;
          }

          .active {
            color: ${colors.dark};
            background: linear-gradient(${colors.logoBg1}, ${colors.logoBg2});
            box-shadow: ${colors.yellowLight} 0 0 3px;
          }

          .active:focus,
          .active:hover {
            transform: translateZ(10px) translateY(-2px);
          }

          .separator {
            background: none;
            cursor: default;
          }
        `}</style>
      </Fragment>
    )
  }
}
