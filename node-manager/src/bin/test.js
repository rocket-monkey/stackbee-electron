import ClusterManager from 'amazonops'
// const ClusterManager = require('amazonops').ClusterManager
const awsConfig = require('../shared/awsCredentials')

export default async () => {
  const manager = new ClusterManager(awsConfig)
  // const manager = new ClusterManager(awsConfig.default)

  const data = await manager.describeStacks('sb-owncloud-deps')
  console.log('data', data)
}