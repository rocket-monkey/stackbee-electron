import colors from 'colors';
import mongoose from 'mongoose';

const getDbConnectionUrl = () => {
  const defaultUrl = process.env.DATABASE ? (process.env.DATABASE) : 'mongodb://admin:98eb9Vb6mfvVVoHT@ds163561.mlab.com:63561/sb-mongo-prod';
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
