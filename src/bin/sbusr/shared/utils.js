import colors from 'colors';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDb } from '../../../shared/db';
import { initSalt } from '../../../shared/db/shared/utils';
import User from '../../../shared/db/schema/user';
import PasswordSalt from '../../../shared/db/schema/passwordSalt';
import { RDS_PROD_DATABASE } from '../../../shared/constants';

const hasModule = (modules, moduleName) => {
  for (let i = 0, len = modules.length; i < len; i += 1) {
    if (modules[i] === moduleName) {
      return true;
    }
  }

  return false;
}

export const createUser = (name, domain, email, pw, modules) => {
  connectDb();
  initSalt();

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
          password: pw,
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
  PasswordSalt.find({}, (err, entries) => {
    if (err) throw err;
    if (!entries.length) {
      console.log(colors.red('No password salt found in db - check startup routine!'));
      return;
    }

    const passwordSaltEntry = entries.pop();

    bcrypt.hash(newUser.password, passwordSaltEntry.salt, (bcryptErr, hashedPassword) => {
      if (bcryptErr) throw bcryptErr;
      newUser.password = hashedPassword; // eslint-disable-line no-param-reassign
      newUser.save((err, user) => {
        mongoose.connection.close();
        if (err) { return console.log('Could not save user!', err); }
        console.log(`User "${user.name}" created`.green);
      });
    });
  });
}

export const killUser = (email) => {
  console.log('TODO'.red);
};
