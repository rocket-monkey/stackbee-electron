#!/usr/bin/env node

import mongoose from 'mongoose';
import processNewCustomers from './shared/processNewCustomers';
import { connectDb } from '../shared/utils';
import User from '../shared/schema/user';

connectDb();
User.find({ 'ecsOwncloudServiceArn': { $exists: false } }, (error, users) => {
  processNewCustomers(users, () => {
    mongoose.connection.close();
  });

});
