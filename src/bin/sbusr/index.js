import colors from 'colors';
import { findArg } from '../../shared/utils';
import {
  createUser,
  killUser,
} from './shared/utils';

export default () => {
  const command = process.argv[3];
  const name = findArg('name=');
  const domain = findArg('domain=');
  const email = findArg('email=');

  if (!email) {
    return console.log('no "email=<email>" given to sbm sbusr command ❗️'.red);
  }

  switch (command) {

    case 'create':
      if (!name) {
        return console.log('no "name=<name>" given to sbm sbusr create command ❗️'.red);
      }
      if (!domain) {
        return console.log('no "domain=<domain>" given to sbm sbusr create command ❗️'.red);
      }
      let modules = findArg('modules=');
      console.log('modules', modules);
      if (modules) {
        modules = modules.indexOf(',') > -1 ? modules.split(',') : [modules];
      } else {
        console.log('no "modules=" param given - using ["owncloud"] as default modules param!'.yellow);
        modules = ['owncloud']; // default
      }

      createUser(name, domain, email, modules);
      break;

    case 'kill':
      killUser(email);
      break;

    default:
      console.log('unknown command entered - read the manual by entering "man" 📚'.blue);
      break;

  }
}
