var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	
	var Downloads = rootRequire("models/downloads");
	Downloads.fromUser(req.session.user, function(downloads) {
		res.render('index', {downloads: downloads});
	});

});

module.exports = router;
