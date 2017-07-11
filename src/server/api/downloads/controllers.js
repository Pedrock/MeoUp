import path from 'path';
import progress from 'request-progress';
import request from 'request';
import youtubedl from 'youtube-dl';
import Download from './models';
import { MeoCloud } from '../../util/meocloud';
import { ServerError } from '../../middleware/express-server-error';

const cleanName = url => url.replace(/ /g, '-').replace(/[^A-Za-z0-9-_.]|[.](?=.*[.])/g, '');

const share = function (api, download, io, filename, maxTries, level) {
  level = (level === undefined) ? 1 : level;
  setTimeout(function () {
    const afterSave = (err, doc, numAffected) => {
      if (err || !numAffected) {
        api.delete(filename);
      } else {
        io.to(`/users/${download._user}`).emit('download', download);
      }
    };

    api.share(filename)
    .then(async (body) => {
      if (body) {
        download.shareUrl = JSON.parse(body).url;
        download.status = 'finished';
        await download.save(afterSave);
      } else if (level < maxTries) {
        await share(api, download, io, filename, maxTries, level++);
      } else {
        download.status = 'finished';
        await download.save(afterSave);
      }
    });
  }, 1000);
};

const uploadFromUrl = async function (api, stream, filename, userId, url, io) {
  return new Promise(async (resolve, reject) => {
    try {
      filename = cleanName(filename);
      stream.pipe(api.getUploadPipe(filename)).catch(reject);

      // eslint-disable-next-line no-unused-vars
      const download = await new Download({_user: userId, url, filename}).save();
      resolve();

      io.to(`/users/${download._user}`).emit('download', download);

      let aborted = false;

      stream.on('progress', function (state) {
        console.log('progress', state.percent);
        download.downloaded = state.size.transferred;
        download.downloadSize = state.size.total;

        download.save((err, doc, numAffected) => {
          if (err || !numAffected) {
            aborted = true;
            stream.abort();
          } else {
            io.to(`/users/${download._user}`)
            .emit('progress', download.id, download.downloaded, download.downloadSize);
          }
        });
      }).on('error', function (err) {
        console.log('error', err);
        download.status = 'error';
        download.save();
      }).on('end', function () {
        if (!aborted) {
          console.log('progress', 'Finished');
          download.status = 'finished';
          download.downloaded = download.downloadSize || download.downloaded;
          share(api, download, io, filename, 6);
        } else {
          console.log('Download aborted');
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

function fileDownloadRequest (req, res) {
  try {
    const url = req.body.url;

    const onFailure = (err) => {
      if (!res.headersSent) {
        res.status(500).end('Download failed.');
        console.log(err);
      }
    };

    const r = progress(request(url));
    r.on('response', function (res2) {
      let filename;
      if (res2.headers['content-disposition']) {
        const parts = res2.headers['content-disposition'].split(';');
        for (let i = 0; i < parts.length; i++) {
          const parts2 = parts[i].split('=');
          if (parts2[0] === 'filename') {
            filename = parts2[1];
            break;
          }
        }
      }

      if (filename === undefined) {
        const parsed = require('url').parse(res2.request.href);
        filename = path.basename(parsed.pathname);
      }

      console.log('Downloading:', filename);

      const meoCloud = new MeoCloud(req.meocloud);
      uploadFromUrl(meoCloud, r, filename, req.user.id, url, req.io).then(() => {
        res.end('Download started.');
      }).catch(onFailure);
    }).on('error', onFailure);
  } catch (error) {
    res.handleServerError(error);
  }
}

function youtubeDownloadRequest (req, res) {
  new Promise((resolve, reject) => {
    try {
      const url = req.body.youtube;
      const args = ['--no-cache-dir'];
      const options = { maxBuffer: 10000 * 1024 };
      youtubedl.getInfo(url, args, options, async (err, info) => {
        if (err) {
          return reject(err);
        }
        try {
          const meoCloud = new MeoCloud(req.meocloud);
          await uploadFromUrl(meoCloud, progress(request.get(info.url)), info._filename, req.user.id, url, req.io);
          res.end('Download started.');
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  }).catch((error) => {
    res.handleServerError(error);
  });
}

export const index = {
  async get (req, res) {
    try {
      res.json(await Download.find({_user: req.user.id}));
    } catch (error) {
      res.handleServerError(error);
    }
  },
  async post (req, res) {
    if (req.body.url) fileDownloadRequest(req, res);
    else if (req.body.youtube) youtubeDownloadRequest(req, res);
    else res.handleServerError(new ServerError('Invalid Request', { status: 400 }));
  },
  async delete (req, res) {
    try {
      await Download.findOneAndRemove({_id: req.params.id, _user: req.user.id});
      res.end();
    } catch (error) {
      res.handleServerError(error);
    }
  }
};