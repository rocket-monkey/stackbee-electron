import colors from 'colors';
import mongoose from 'mongoose';
import config from '../../internals/config';

const getDbConnectionUrl = () => {
  const defaultUrl = process.env.DATABASE ? (process.env.DATABASE) : config.database;
  return process.env.NODE_ENV === 'test' ? 'mongodb://localhost:27017/sb-owncloud-test' : defaultUrl;
};

export const connectDb = () => {
  // Use promises for mongoose async operations.
  mongoose.Promise = Promise;
  mongoose.connect(getDbConnectionUrl(), {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } },
  });

  mongoose.connection.on('connected', () => {
    console.log(colors.green(`Mongoose default connection open to ${getDbConnectionUrl()}`));
  });

  mongoose.connection.on('error', (err) => {
    console.log(colors.red(`Mongoose default connection error: ${err}`));
  });

  mongoose.connection.on('disconnected', () => {
    console.log(colors.green('Mongoose default connection disconnected'));
  });

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log(colors.rainbow('Mongoose default connection disconnected through app termination')); // eslint-disable-line max-len
      process.exit(0);
    });
  });
};
