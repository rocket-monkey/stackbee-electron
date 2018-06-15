const path = require('path')

const resolverOptions = {
  "root": ["."],
  "cwd": "babelrc",
  "alias": {
    "@core": "./src/@core",
    "@printers": "./src/@printers",
    "@shared": "./src/@shared"
  }
}

const internalNodeModulesRegExp = /src(?!\/(?!.*js))/

module.exports = {
  webpack(config, { defaultLoaders }) {
    // Allows you to load Electron modules and
    // native Node.js ones into your renderer
    config.target = 'electron-renderer'

    config.resolve.alias['@core'] = path.resolve(__dirname, 'src', '@core')
    defaultLoaders.babel.options.plugins = [["module-resolver", resolverOptions]]
    console.log('defaultLoaders', defaultLoaders)
    config.module.rules.push({
      test: /\.+(js|jsx)$/,
      use: defaultLoaders.babel,
      include: [internalNodeModulesRegExp],
    })
    // get aliases from .babelrc
    for (const key of Object.keys(resolverOptions.alias)) {
      config.resolve.alias[key] = path.resolve(__dirname, resolverOptions.alias[key])
    }

    return config
  },
  exportPathMap() {
    // Let Next.js know where to find the entry page
    // when it's exporting the static bundle for the use
    // in the production version of your app
    return {
      '/start': { page: '/start' }
    }
  }
}

