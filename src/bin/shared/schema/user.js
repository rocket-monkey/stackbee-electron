import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// create a schema
const userSchema = new Schema({
  name                  : String,
  email                 : { type: String, required: true, unique: true },
  password              : { type: String, required: true },
  domain                : { type: String, required: true },
  owncloudPort          : { type: Number, required: false },
  owncloudDbHost        : { type: String, required: false },
  owncloudDbName        : { type: String, required: false },
  owncloudDbUser        : { type: String, required: false },
  owncloudDbPassword    : { type: String, required: false },
  owncloudRoute         : { type: String, required: false },
  ecsOwncloudServiceArn : { type: String, required: false },
  roles                 : { type: Array, default: ['user'] },
  provider              : { type: Object, default: {} },
  createdAt             : { type: Date, default: Date.now },
  updatedAt             : { type: Date, default: Date.now },
  rememberPwCode        : { type: String, default: null },
  rememberPwCodeAt      : { type: Number, default: null },
});

// the schema is useless so far
// we need to create a model using it
const User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
export default User;