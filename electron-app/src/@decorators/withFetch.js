import {
  compose,
  withState
} from 'recompose'
import StackbeeAPI from '@api'

const isDev = require('electron-is-dev')

let api = null
let fetchRunning = null

const withDataState = withState('data', 'setData', null)
const withPageState = withState('page', 'setPage', 0)
const withLoadingState = withState('loading', 'setLoading', false)
const withErrorState = withState('error', 'setError', null)

const withFetchHOC = config => Component => props => {

  const cfg = typeof config === 'function' ? config(props) : config

  const fetch = (endpoint, data) => {
    if (props.loading) {
      return
    }

    clearTimeout(fetchRunning)
    fetchRunning = setTimeout(() => {
      if (!props.loading) {
        props.setLoading(true)
      }
      console.log('FETCH API!!', endpoint || cfg.endpoint, data || cfg.data)
      api
        .execute(cfg.method || 'GET', endpoint || cfg.endpoint, data || cfg.data)
        .then(res => res.json && res.json() || {})
        .then(json => {
          if (Object.keys(json).length === 0) {
            props.setError('Could not fetch API')
          } else {
            props.setLoading(false)
          }
          props.setData(json)
          setTimeout(() => {
            fetchRunning = null
          }, 10)
        })
        .catch(e => {
          props.setLoading(false)
          props.setError('Could not fetch API')
          setTimeout(() => {
            fetchRunning = null
          }, 10)
        })
    }, 10)
  }

  if (!api && props.appState) {
    api = new StackbeeAPI(isDev, props.appState)
  }

  const pageChanged = (api && props.data && props.data.page !== props.page)
  if ((api && !props.data && !props.error && !fetchRunning) || (api && !fetchRunning && pageChanged)) {
    fetch()
  }

  if (!props.appState) {
    console.warn('WithFetchHOC: no appState given in props!')
  }

  return <Component {...props} fetch={fetch} api={api} />
}

export default config => WithFetch => compose(
  withDataState,
  withPageState,
  withLoadingState,
  withErrorState,
  withFetchHOC(config)
)(WithFetch)
