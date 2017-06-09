#!/usr/bin/env node

import mongoose from 'mongoose';
import processNewCustomers from './shared/processNewCustomers';
import { connectDb } from '../shared/utils';
import User from '../shared/schema/user';

if (process.argv.length < 4) {
  console.log('please enter user and email, two arguments..'.red);
} else {
  const name = process.argv[2];
  const email = process.argv[3];

  connectDb();

  const domain = name;
  console.log('start creating user', name);
  User
    .find()
    .sort({ 'owncloudPort': -1 })
    .exec((error, users) => {
      let owncloudPort = 1080;
      if (users.length > 0) {
        owncloudPort = users[0].owncloudPort + 1;
      }
      const newUser = new User({
        name,
        email,
        password: 'not-yet-set',
        domain,
        owncloudPort,
        owncloudDbHost: 'sb-maria-prod.cfwyrgfxdbjd.eu-west-1.rds.amazonaws.com'
      });
      newUser.save((err, user) => {
        mongoose.connection.close();
        if (err) { return console.log('Could not save user!', err); }
        console.log(`User "${name}" created`.green);
      });
    });
}