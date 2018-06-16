import {
  compose,
  lifecycle,
  withState,
  withHandlers,
  branch,
  renderNothing
} from 'recompose'

const withGlobalsState = withState('globals', 'setGlobals', {})

const withLifecycle = lifecycle({
  componentDidMount () {
    const { getGlobal } = require('electron').remote
    const dbConnected = getGlobal('dbConnected')

    this.props.setGlobals({
      dbConnected
    })
  }
})

const withRenderGlobals = withHandlers({
  renderGlobals: ({ globals }) => () => Object.keys(globals).map(key => <span>{key}: {globals[key].toString()}</span>)
})

const onlyRenderWhenGlobalsAreSet = branch(
  ({ globals }) => Object.keys(globals).length === 0,
  renderNothing
)

export default WithGlobals => compose(
  withGlobalsState,
  withLifecycle,
  withRenderGlobals,
  onlyRenderWhenGlobalsAreSet
)(WithGlobals)
