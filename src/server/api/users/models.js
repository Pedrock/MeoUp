import mongoose from 'mongoose';
import argon2 from 'argon2';
import validator from 'validator';
import { ServerError } from '~middleware/express-server-error';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    minlength: 3,
    trim: true,
    lowercase: true,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'Invalid email address'],
    require: true
  },
  firstName: String,
  lastName: String,
  password: {
    type: String,
    require: true,
    minlength: 5
  },
  admin: {
    type: Boolean,
    default: false,
    require: true
  },
  oauthToken: String,
  oauthTokenSecret: String,
  meocloudToken: String,
  meocloudSecret: String
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

userSchema.pre('save', async function (callback) {
  if (!this.isModified('password')) return callback();
  this.password = await argon2.hash(this.password);
  callback();
});

userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new ServerError('User taken.', { status: 409, log: false }));
  }
});

userSchema.set('toObject', { getters: true,
  transform (doc, ret, options) {
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

export default User;
