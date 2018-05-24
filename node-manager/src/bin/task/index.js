import colors from 'colors';
import { findArg } from '../../shared/utils';
import {
  syncOcUsers,
  processNewOcUsers,
  updateTaskDefinition,
  updateTaskDefinitions,
} from './shared/owncloud';

export default () => {
  const command = process.argv[3];

  switch (command) {

    case 'oc-new-users':
      processNewOcUsers();
      break;

    case 'oc-sync-users':
      syncOcUsers();
      break;

    case 'oc-update-taskdefs-all':
      updateTaskDefinitions();
      break;

    case 'oc-update-taskdef':
      const domain = findArg('domain=');
      if (!domain) {
        return console.log('no "domain=<domain>" given to sbm task command ❗️'.red);
      }
      updateTaskDefinition(domain);
      break;

    default:
      console.log('unknown command entered - read the manual by entering "man" 📚'.blue);
      break;

  }
}
