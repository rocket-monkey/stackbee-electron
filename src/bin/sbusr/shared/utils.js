import mongoose from 'mongoose';
import { connectDb } from '../../../shared/db';
import User from '../../../shared/db/schema/user';

export const createUser = (name, domain, email) => {
  connectDb();

  // TODO: make modules agnostic

  console.log('start creating user', name);
  User
    .find()
    .sort({ 'owncloudMeta.owncloudPort': 1 })
    .exec((error, users) => {
      let owncloudPort = 1080;
      if (users.length > 0) {
        owncloudPort = users[0].owncloudMeta.owncloudPort + 1;
      }
      const newUser = new User({
        name,
        email,
        password: 'not-yet-set',
        domain,
        owncloudMeta: {
          owncloudPort,
          owncloudDbHost: 'sb-maria-prod.cfwyrgfxdbjd.eu-west-1.rds.amazonaws.com',
        },
      });
      newUser.save((err, user) => {
        mongoose.connection.close();
        if (err) { return console.log('Could not save user!', err); }
        console.log(`User "${name}" created`.green);
      });
    });
};

export const killUser = (email) => {
  console.log('TODO'.red);
};
