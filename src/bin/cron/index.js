import colors from 'colors';
import { findArg } from '../../shared/utils';
import {
  processNewOcUsers,
} from './shared/owncloud';

export default () => {
  const command = process.argv[3];
  const task = findArg('task=');

  if (!task) {
    return console.log('no "task=<task>" given to sbm cron command ❗️'.red);
  }

  switch (command) {

    case 'users':
      if (task === 'owncloud' || task === 'oc') {
        processNewOcUsers();
      }
      break;

    default:
      console.log('unknown command entered - read the manual by entering "man" 📚'.blue);
      break;

  }
}
