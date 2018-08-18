import {
  compose,
  lifecycle,
  withState,
  withHandlers,
  branch,
  renderComponent
} from 'recompose'
import Loading from '@core/loading'

const withGlobalsState = withState('globals', 'setGlobals', {})

const withLifecycle = lifecycle({
  componentDidMount () {
    const { getGlobal } = require('electron').remote
    const isDev = getGlobal('isDev')

    this.props.setGlobals({
      isDev,
      locale: navigator.language.split('-')[0]
    })
  }
})

const withRenderGlobals = withHandlers({
  renderGlobals: ({ globals }) => () => Object.keys(globals).map(key => {
    const value = JSON.stringify(globals[key])
    return (
      <span key={key}>{key}: {value}&nbsp;</span>
    )
  })
})

const withUpdateGlobals = withHandlers({
  updateGlobals: ({ globals, setGlobals }) => (update) => setGlobals({
    ...globals,
    ...update
  })
})

const onlyRenderWhenGlobalsAreSet = branch(
  ({ globals }) => Object.keys(globals).length === 0 || !globals.locale,
  renderComponent(Loading)
)

export default WithGlobals => compose(
  withGlobalsState,
  withLifecycle,
  withRenderGlobals,
  withUpdateGlobals,
  onlyRenderWhenGlobalsAreSet
)(WithGlobals)
