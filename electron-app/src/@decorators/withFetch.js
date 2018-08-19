import {
  compose,
  withState
} from 'recompose'
import StackbeeAPI from '@api'

const isDev = require('electron-is-dev')

let api = null

const withDataState = withState('data', 'setData', null)
const withLoadingState = withState('loading', 'setLoading', true)
const withErrorState = withState('error', 'setError', null)

const withFetchHOC = config => Component => props => {

  const fetch = (data) => {
    api
      .execute(config.method || 'GET', config.endpoint, data || config.data)
      .then(res => res.json && res.json() || {})
      .then(json => {
        if (Object.keys(json).length === 0) {
          props.setError('Could not fetch API')
        } else {
          props.setLoading(false)
        }
        props.setData(json)
      })
  }

  if (!api && props.appState) {
    api = new StackbeeAPI(isDev, props.appState)
  }

  if (api && !props.data) {
    fetch()
  }

  if (!props.appState) {
    console.warn('WithFetchHOC: no appState given in props!')
  }

  return <Component {...props} fetch={fetch} />
}

export default config => WithFetch => compose(
  withDataState,
  withLoadingState,
  withErrorState,
  withFetchHOC(config)
)(WithFetch)
