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
    this.post = this.post.bind(this)

    this.token = appSate.auth && appSate.auth.token
  }

  post(endpoint, data) {
    return fetch(`${this.url}${endpoint}?token=${this.token}`, {
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
