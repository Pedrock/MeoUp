var request = require('request');
var progress = require('request-progress');

var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	var youtubedl = require('youtube-dl');
	var url = req.body.url;

	try {
		var args = ['--no-cache-dir'];
		var options = {maxBuffer: 10000 * 1024};
		youtubedl.getInfo(url, args, options, function (err, info) {
			if (err) {
				res.status(400);
				res.end('Download failed.');
				console.log(err.stack);
				return;
			}

			try
			{
				var meoCloud = new (rootRequire('helpers/meocloud')).MeoCloud(req.MeoUp);

				rootRequire('helpers/uploader')
					.uploadFromUrl(meoCloud, progress(request.get(info.url)), info._filename, req.session.user, url);

				res.status(200);
				res.end('Download started.');
			}
			catch (ex)
			{
				console.log(ex.stack);
				res.status(400);
				res.end('Download failed.');
			}

		});
	}
	catch (ex)
	{
		console.log(ex.stack);
		res.status(400);
		res.end('Download failed.');
	}
});

module.exports = router;
