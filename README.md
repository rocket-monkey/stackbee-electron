# stackbee.io electron app [![Build Status](https://travis-ci.org/rocket-monkey/stackbee-electron.svg?branch=master)](https://travis-ci.org/rocket-monkey/stackbee-electron)

A desktop application built with electron, available to install for all platforms MacOSX, Windows and Linux. The app implements all the services offered by stackbee.io. Just like a web-application, but packed in a native installable app - without the browser issues and with full access to the local computer 😎

The app itself is built with a modern web stack:

* next.js (+webpack)
* react.js
* react-intl
* styled-jsx
* mobx
* electron
* electron-next

## Project setup

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/rocket-monkey/stackbee-electron
# Go into the repository
cd stackbee-electron
# Install dependencies
yarn
# Run the app in dev mode (with HMR!)
yarn dev
```

## Release

To create a new release, update the version in ./package.json and ./app/package.json and just push to master (or merge pr to master). Our build-pipeline with travis CI will take care of building a mac, win and linux executable and update data and push everything in a new release to github.

```bash
# Create the executable for the current platform
yarn dist
```

### Workarounds

* stupid collition with "url" module coming with next and "URL" class used in electron-builder's httpExecutor.ts -.-
