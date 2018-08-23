import { action } from 'mobx'

const isDev = require('electron-is-dev')

const getConnectionUrl = (isDev) => {
  const url = isDev ? 'http://localhost:3000/api' : 'http://localhost:3000/api'
  console.log('API route: ', url)
  return url
}

export default class StackbeeAPI {
  appState = null
  url = ''
  token = null

  constructor(isDev, appSate) {
    this.url = getConnectionUrl(isDev)

    this.appState = appSate
    this.token = appSate.auth && appSate.auth.token

    this.livenessProbe()
    if (!isDev) {
      console.warn('Start liveness probe interval...')
      setInterval(this.livenessProbe, 1000 * 60 * 5)
    }
  }

  onLivenessProbeFailure = action(() => {
    console.log('LivenessProbe failed!')
    this.appState.online = false
    // this.appState.auth = {}
  })

  livenessProbe = () => {
    // TODO: when 200 ok, also check validity of a possible stored token!
    this
      .get('?livenessProbe=true')
      .then(res => res.status !== 200 && this.onLivenessProbeFailure())
      .catch(_ => this.onLivenessProbeFailure())
  }

  execute = (method, endpoint, data) => {
    switch (method) {
      default:
      case 'GET':
        return this.get(endpoint)
      case 'POST':
        return this.post(endpoint, data)
    }
  }

  get = (endpoint) => {
    return fetch(`${this.url}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${this.token}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).catch(error => {
      console.error('🚨🚨 !!StackbeeAPI CRASHED!! 🚨🚨', error)
      return {}
    })
  }

  post = (endpoint, data) => {
    return fetch(`${this.url}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${this.token}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).catch(error => {
      console.error('🚨🚨 !!StackbeeAPI CRASHED!! 🚨🚨', error)
      return {}
    })
  }
}
