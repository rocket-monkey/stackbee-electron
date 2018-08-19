const getConnectionUrl = (isDev) => {
  const url = isDev ? 'http://localhost:3000/api' : 'http://localhost:3000/api'
  console.log('API route: ', url)
  return url
}

export default class StackbeeAPI {
  url = ''
  token = null

  constructor(isDev, appSate) {
    this.url = getConnectionUrl(isDev)
    this.get = this.get.bind(this)
    this.post = this.post.bind(this)
    this.execute = this.execute.bind(this)

    this.token = appSate.auth && appSate.auth.token
  }

  execute(method, endpoint, data) {
    switch (method) {
      default:
      case 'GET':
        return this.get(endpoint)
      case 'POST':
        return this.post(endpoint, data)
    }
  }

  get(endpoint) {
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

  post(endpoint, data) {
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
