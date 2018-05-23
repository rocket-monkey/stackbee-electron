import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// create a schema
const passwordSaltSchema = new Schema({
  salt: String,
  createdAt: { type: Date, default: Date.now },
});

// the schema is useless so far
// we need to create a model using it
const PasswordSalt = mongoose.model('PasswordSalt', passwordSaltSchema);

// make this available to our users in our Node applications
export default PasswordSalt;