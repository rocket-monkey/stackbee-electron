import Layout, { appState } from '@core/layout'
import PhotoTagger from '@sites/photoTagger'

export default () => (
  <Layout appState={appState}>
    <PhotoTagger />
  </Layout>
)
