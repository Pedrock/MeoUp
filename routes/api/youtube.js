var request = require('request');
var progress = require('request-progress');

var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	var youtubedl = require('youtube-dl');
	var url = req.body.url;
	
	youtubedl.getInfo(url, function(err, info) {
		if (err)
		{
			res.end('Download failed.');
			console.log(err.stack);
			return next(err);
		}

		var meoCloud = new (rootRequire('helpers/meocloud')).MeoCloud(req.MeoUp);

		rootRequire('helpers/uploader')
			.uploadFromUrl(meoCloud, progress(request.get(info.url)), info._filename, req.session.user, url);

		res.end('Download started.');
	});
});

module.exports = router;
