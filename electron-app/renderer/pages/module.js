import Layout, { appState } from '@core/layout'
import Module from '@sites/module'

export default () => (
  <Layout appState={appState}>
    <Module />
  </Layout>
)
