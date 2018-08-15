const getConnectionUrl = (isDev) => {
  const url = isDev ? 'http://localhost:3000/api' : 'http://localhost:3000/api'
  console.log('API route: ', url)
  return url
}

export default class StackbeeAPI {
  url = ''
  token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHN0YWNrYmVlLmlvIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNDk3NjQ0MTgyfQ.vBpRonrwXE2EU96NUWJT0nA9eTCpBlyjn678fAgNOO8'

  constructor(isDev) {
    this.url = getConnectionUrl(isDev)
  }

  post(endpoint, data) {
    return fetch(`${this.url}${endpoint}?token=${this.token}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  }
}
