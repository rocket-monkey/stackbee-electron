import colors from 'colors';
import { findArg } from '../../shared/utils';
import {
  startEcsNodejs,
  startEcsNginx,
  startEcsOwncloud,
  startEcsOwncloudDeps,
} from './shared/createCluster';
import {
  killEcsNodejs,
  killEcsNginx,
  killEcsOwncloud,
} from './shared/killCluster';

export default () => {
  const command = process.argv[3];
  const name = findArg('name=');

  if (!name) {
    return console.log('no "name=<name>" given to sbm ecs command ❗️'.red);
  }

  switch (command) {

    case 'create':
      if (name === 'owncloud-deps' || name === 'oc-deps') {
        startEcsOwncloudDeps();
      } else if (name === 'owncloud' || name === 'oc') {
        startEcsOwncloud();
      } else if (name === 'nodejs' || name === 'node') {
        startEcsNodejs();
      } else if (name === 'nginx') {
        startEcsNginx();
      } else {
        console.log('unknown name entered, possible values are: owncloud-deps (oc-deps), owncloud (oc), nodejs (node) 👍'.blue);
      }
      break;

    case 'kill':
      if (name === 'owncloud' || name === 'oc') {
        killEcsOwncloud();
      } else if (name === 'nodejs' || name === 'node') {
        killEcsNodejs();
      } else if (name === 'nginx') {
        killEcsNginx();
      } else {
        console.log('unknown name entered, possible values are: owncloud (oc), nodejs (node) 👍'.blue);
      }
      break;

    default:
      console.log('unknown command entered - read the manual by entering "man" 📚'.blue);
      break;

  }
}
