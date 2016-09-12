var express = require('express');
var router = express.Router();

var Downloads = rootRequire('models/downloads');

router.get('/', function(req, res, next) {
	Downloads.fromUser(req.session.user, function(downloads) {
		res.render('downloads_list', {downloads: downloads});
	});
});

router.post('/', function(req, res, next) {
	if (req.body.delete === undefined) return next();
	Downloads.getFilename(req.session.user, req.body.delete, function(results)
	{
		if (results[0] !== undefined && results[0].filename !== undefined)
		{
			Downloads.delete(req.session.user, req.body.delete);
			var meoCloud = new (rootRequire("helpers/meocloud")).MeoCloud(req.MeoUp);
			meoCloud.delete(results[0].filename);
		}
	});
});

router.post('/', function(req, res, next) {
	if (req.body.url === undefined) return next();

	var progress = require('request-progress');
	var request = require('request');

	var url = req.body.url;

	var r = progress(request(url));
	r.on('response',  function (res2) {
		var filename = undefined;
		if (res2.headers['content-disposition'])
		{
			var parts = res2.headers['content-disposition'].split(';');
			for (var i = 0; i < parts.length; i++)
			{
				var parts2 = parts[i].split('=');
				if (parts2[0] === 'filename')
				{
					filename = parts2[1];
					break;
				}
			}
		}

		if (filename === undefined)
		{
			var parsed = require("url").parse(res2.request.href);
			filename = require("path").basename(parsed.pathname);
		}

		console.log('Downloading:', filename);

		var meoCloud = new (rootRequire("helpers/meocloud")).MeoCloud(req.MeoUp);
		rootRequire("helpers/uploader").uploadFromUrl(meoCloud, r, filename, req.session.user, url);
		res.end('Download started.');
	});
});

router.post('/', function(req, res, next) {
	if (req.body.update === undefined) return next();
	Downloads.getUpdates(req.session.user, req.body.update, function(results)
	{
		res.end(JSON.stringify(results));
	});
});

module.exports = router;
