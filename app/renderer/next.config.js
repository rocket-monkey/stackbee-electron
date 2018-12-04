const path = require('path')
const moduleResolver = require('babel-plugin-module-resolver')
const reactIntl = require('babel-plugin-react-intl')
const withCSS = require('@zeit/next-css')

const resolverOptions = {
  "root": ["./app"],
  "cwd": "babelrc",
  "alias": {
    "@api": "./app/src/@api",
    "@config": "./app/src/@config",
    "@decorators": "./app/src/@decorators",
    "@core": "./app/src/@core",
    "@sites": "./app/src/@sites",
    "@lang": "./app/src/@lang",
    "@helpers": "./app/src/@helpers",
    "@icons": "./app/src/@icons",
    "@printers": "./app/src/@printers",
    "@tagger": "./app/src/@tagger",
    "@styles": "./app/src/@styles"
  }
}

const internalNodeModulesRegExp = /src(?!\/(?!.*js))/

module.exports = withCSS({
  webpack(config, { defaultLoaders, dev }) {
    // Allows you to load Electron modules and
    // native Node.js ones into your renderer
    config.target = 'electron-renderer'

    config.resolve.alias['@core'] = path.resolve(__dirname, 'src', '@core')

    // Inject babel plugins, especially for our module-resolver and styled-jsx
    defaultLoaders.babel.options.plugins = [
      [moduleResolver, resolverOptions],
      ['styled-jsx/babel', { 'optimizeForSpeed': true }],
      [reactIntl, { 'messagesDir': 'app/src/@lang/.messages/' }]
    ]

    // As soon as we inject babel plugins, we have to add this rule otherwise JSX is suddenly unsupported oO
    config.module.rules.push({
      test: /\.+(js|jsx)$/,
      use: defaultLoaders.babel,
      include: [internalNodeModulesRegExp],
    })

    // Get aliases from resolver options
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
})

