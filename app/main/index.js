
// Native
const { format } = require('url')

// Packages
const { BrowserWindow, app } = require('electron')
const isDev = require('electron-is-dev')
const prepareNext = require('electron-next')
const { resolve } = require('app-root-path')
const server = require('./server')

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer')

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 600,
    minWidth: 550,
    backgroundColor: '#333',
    titleBarStyle: 'hidden',
    frame: false,
    webPreferences: {
      webSecurity: false
    }
  })

  const devPath = 'http://localhost:8000/start'
  const prodPath = 'http://localhost:8023/start/index.html'

  await server(isDev)

  global.isDev = isDev

  const url = isDev ? devPath : prodPath
  mainWindow.loadURL(url)
})

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)
