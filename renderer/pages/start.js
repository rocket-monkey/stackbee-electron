import Layout, { appState } from '@core/layout'
import Home from '@sites/home'

export default () => (
  <Layout appState={appState}>
    <Home />
  </Layout>
)
