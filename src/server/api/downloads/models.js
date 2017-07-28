// @flow
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;

const downloadSchema = new mongoose.Schema({
  _user: {
    type: ObjectId,
    require: true,
    ref: 'User',
    index: true
  },
  url: {
    type: String,
    require: true
  },
  filename: {
    type: String,
    require: true
  },
  downloaded: {
    type: Number,
    default: 0,
    require: true
  },
  downloadSize: Number,
  status: {
    type: String,
    enum: ['error', 'progress', 'finished'],
    default: 'progress',
    require: true
  },
  shareUrl: String
}, {
  timestamps: true
});

downloadSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

const Download = mongoose.model('Download', downloadSchema);

export default Download;
