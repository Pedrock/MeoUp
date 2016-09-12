var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	if (req.session.user !== undefined)
		return res.redirect('/');
	var Users = rootRequire('models/users.js');
	console.log(req.body.username);
	Users.create(req.body.username, req.body.password, function(err, result) {
		if (err)
			res.end(JSON.stringify([err, result])); // TODO
		else
		{
			req.session.user = result.insertId;
			res.redirect('/oauth');
		}
	});
});

module.exports = router;
