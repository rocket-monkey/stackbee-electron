import mongoose from 'mongoose';
import { connectDb } from '../../../shared/db';
import User from '../../../shared/db/schema/user';
import { RDS_PROD_DATABASE } from '../../../shared/constants';

const hasModule = (modules, moduleName) => {
  for (let i = 0, len = modules.length; i < len; i += 1) {
    if (modules[i] === moduleName) {
      return true;
    }
  }

  return false;
}

export const createUser = (name, domain, email, modules) => {
  connectDb();

  if (hasModule(modules, 'owncloud')) {
    User
      .find()
      .sort({ 'owncloudMeta.owncloudPort': 1 })
      .exec((error, users) => {
        let owncloudPort = 1080;
        if (users.length > 0) {
          owncloudPort = users[0].owncloudMeta.owncloudPort + 1;
        }
        createUserNow({
          name,
          email,
          password: 'not-yet-set',
          domain,
          modules,
          owncloudMeta: {
            owncloudPort,
            owncloudDbHost: RDS_PROD_DATABASE,
          },
        });
      });
  } else {
    console.log('No known modules conf given! no user created 😭'.red);
    mongoose.connection.close();
  }
};

const createUserNow = (data) => {
  const newUser = new User(data);
  newUser.save((err, user) => {
    mongoose.connection.close();
    if (err) { return console.log('Could not save user!', err); }
    console.log(`User "${user.name}" created`.green);
  });
}

export const killUser = (email) => {
  console.log('TODO'.red);
};
