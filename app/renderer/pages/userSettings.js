import Layout, { appState } from '@core/layout'
import UserSettings from '@sites/userSettings'

export default () => (
  <Layout appState={appState}>
    <UserSettings />
  </Layout>
)
