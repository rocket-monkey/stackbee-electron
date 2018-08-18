import Layout, { appState } from '@core/layout'
import Admin from '@sites/admin'

export default () => (
  <Layout appState={appState} isAdminRoute>
    <Admin />
  </Layout>
)
