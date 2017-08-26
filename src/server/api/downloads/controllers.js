// @flow
import path from 'path';
import progress from 'request-progress';
import request from 'request';
import youtubedl from 'youtube-dl';
import Download from './models';
import { MeoCloud } from '../../util/meocloud';
import { ServerError } from '../../middleware/express-server-error';
import MeoCloudUploader from '../../util/meoCloudUploader';

const progressOptions = {
  throttle: 200
};

async function fileDownloadRequest (req: $Request, res: $Response) {
  try {
    const url = req.body.url;

    const onFailure = (err) => {
      if (!res.headersSent) {
        res.status(500).end('Download failed.');
        console.log(err);
      }
    };

    const r = progress(request(url), progressOptions);
    r.on('response', async function (res2) {
      let filename: ?string;
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
        const parsed: any = require('url').parse(res2.request.href);
        filename = path.basename(parsed.pathname);
      }

      console.log('Downloading:', filename);

      const meoCloud = new MeoCloud(req.meocloud);
      const meoCloudUploader = new MeoCloudUploader(meoCloud, r, filename, req.user.id, url, req.io);
      meoCloudUploader.upload()
      .then(() => {
        res.end('Download started.');
      })
      .catch(onFailure);
    }).on('error', onFailure);
  } catch (error) {
    console.log('File error');
    res.handleServerError(error);
  }
}

async function youtubeDownloadRequest (req: $Request, res: $Response) {
  new Promise((resolve, reject) => {
    try {
      const url = req.body.youtube;
      const args = ['--no-cache-dir'];
      const options = { maxBuffer: 20000 * 1024 };
      youtubedl.getInfo(url, args, options, async (err, info) => {
        if (err) {
          return reject(err);
        }
        try {
          const meoCloud = new MeoCloud(req.meocloud);
          const stream = progress(request.get(info.url), progressOptions);
          const meoCloudUploader = new MeoCloudUploader(meoCloud, stream, info._filename, req.user.id, url, req.io);
          await meoCloudUploader.upload();
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
  async get (req: $Request, res: $Response) {
    try {
      res.json(await Download.find({_user: req.user.id}).sort('createdAt'));
    } catch (error) {
      res.handleServerError(error);
    }
  },
  async post (req: $Request, res: $Response) {
    if (req.body.url) fileDownloadRequest(req, res);
    else if (req.body.youtube) youtubeDownloadRequest(req, res);
    else res.handleServerError(new ServerError('Invalid Request', { status: 400 }));
  },
  delete (req: $Request, res: $Response) {
    return new Promise(async () => {
      try {
        const download = await Download.findOneAndRemove({_id: req.params.id, _user: req.user.id});
        if (!download) {
          return res.handleServerError(new ServerError('Not found', { status: 404 }));
        }
        const meoCloud = new MeoCloud(req.meocloud);
        meoCloud.delete(download.filename);
        req.io.to(`/users/${download._user}`).emit('delete', download.id);
        res.end();
      } catch (error) {
        res.handleServerError(error);
      }
    });
  }
};
