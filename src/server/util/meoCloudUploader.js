// @flow
import _ from 'lodash';
import { MeoCloud } from './meocloud';
import Download from '../api/downloads/models';

const cleanName = function (url) {
  return url.replace(/ /g, '-').replace(/[^A-Za-z0-9-_.]|[.](?=.*[.])/g, '');
};

export default class MeoCloudUploader {
  api: MeoCloud;
  stream: any;
  uploadStream: any;
  filename: string;
  userId: string;
  url: string;
  io: any;
  maxTries: number;
  download: Download;
  save: Function;
  aborted: boolean;

  constructor (api: MeoCloud, stream: any, filename: string, userId: string, url: string, io: any) {
    this.api = api;
    this.stream = stream;
    this.filename = cleanName(filename);
    this.userId = userId;
    this.url = url;
    this.io = io;
    this.maxTries = 6;
    this.download = null;
    this.aborted = false;

    this.save = _.throttle((callback) => {
      this.download.updatedAt = new Date();
      return this.download
        .save((err, doc, numAffected) => {
          if (err) {
            console.error(err);
          } else if (!numAffected) {
            console.log('numAffected', numAffected);
            this.aborted = true;
            this._abort();
          }
          if (callback) {
            callback(err, doc, numAffected);
          }
        });
    }, 1000);
  }

  onError () {
    console.error('download/upload error');
    if (!this.aborted) {
      this._abort();
      this.aborted = true;
    }
    if (this.download !== null) {
      this.download.status = 'error';
      this.download.save();
      this.io.to(`/users/${this.download._user}`).emit('download', this.download);
    }
  };

  async upload () {
    return new Promise(async (resolve, reject) => {
      try {
        const { filename, userId, url } = this;
        this.uploadStream = this.stream
        .on('error', this.onError.bind(this))
        .pipe(this.api.getChuckedUploadStream(filename))
        .on('error', this.onError.bind(this));

        this.download = await new Download({_user: userId, url, filename}).save();
        resolve();

        this.io.to(`/users/${this.download._user}`).emit('download', this.download);

        this.stream.on('progress', (state) => {
          this.download.downloaded = state.size.transferred;
          this.download.downloadSize = state.size.total;

          this.io.to(`/users/${this.download._user}`)
          .emit('progress', this.download.id, this.download.downloaded, this.download.downloadSize);
          this.save();
        });

        this.uploadStream.on('finish', () => {
          if (!this.aborted) {
            console.log('progress', 'Finished');
            this.download.status = 'finished';
            this.download.downloaded = this.download.downloadSize || this.download.downloaded;
            this._share();
          } else {
            console.log('Download aborted');
          }
        });
      } catch (error) {
        this._abort();
        this.onError();
        reject(error);
      }
    });
  }

  _abort () {
    this.stream.abort();
    this.uploadStream.abort();
  }

  _share (level: number = 1) {
    console.log('sharing... ' + level);

    const afterSave = (err, doc, numAffected) => {
      if (err || !numAffected) {
        if (this.download.status === 'finished') {
          this.api.delete(this.filename);
        }
      } else {
        this.io.to(`/users/${this.download._user}`).emit('download', this.download);
      }
    };

    setTimeout(() => {
      this.api.share(this.filename)
      .then((body) => {
        if (body) {
          this.download.shareUrl = JSON.parse(body).url;
          this.download.status = 'finished';
          console.log('share success');
          return this.save(afterSave);
        } else {
          throw new Error('Share with empty body');
        }
      }).catch(() => {
        if (level < this.maxTries) {
          return this._share(level + 1);
        } else {
          this.download.status = 'finished';
          return this.save(afterSave);
        }
      });
    }, 500);
  };
}
