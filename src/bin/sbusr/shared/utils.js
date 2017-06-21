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
  if (pw.indexOf('{') > -1 || pw.indexOf('}') > -1) {
    return console.log('no curly braces "{}" allowed in passwords, crypto will break! 🙈'.red);
  }

  connectDb();
  initSalt();

  if (hasModule(modules, 'owncloud')) {
    User
      .find({ 'modules': { $in: ['owncloud'] } })
      .sort({ 'owncloudMeta.port': -1 })
      .limit(1)
      .exec((error, users) => {
        let port = 1080;
        if (users.length > 0) {
          port = users[0].owncloudMeta.port + 1;
        }
        const adminPass = Math.random().toString(36).slice(-8);
        createUserNow({
          name,
          email,
          password: pw,
          domain,
          modules,
          owncloudMeta: {
            port,
            dbHost: RDS_PROD_DATABASE,
            adminPass,
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

export const hash = (input) => {
  if (input.indexOf('{') > -1 || input.indexOf('}') > -1) {
    return console.log('no curly braces "{}" allowed in passwords, crypto will break! 🙈'.red);
  }

  connectDb();
  initSalt();
  PasswordSalt.find({}, (err, entries) => {
    if (err) throw err;
    if (!entries.length) {
      console.log(colors.red('No password salt found in db - check startup routine!'));
      return;
    }

    const passwordSaltEntry = entries.pop();

    bcrypt.hash(input, passwordSaltEntry.salt, (bcryptErr, hashedValue) => {
      if (bcryptErr) throw bcryptErr;
      mongoose.connection.close();
      console.log(`Hashed value: ${hashedValue}`.blue);
    });
  });
};

export const killUser = (email) => {
  console.log('TODO'.red);
};
