import express from 'express';
import { connectDb } from './bin/shared/utils';
import User from './bin/shared/schema/user';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  connectDb();
  User.find({}, (error, users) => {
    console.log('User.find error: ', error);
    console.log('User.find users: ', users);
  });
  console.log('Example app listening on port 3000!');
});
