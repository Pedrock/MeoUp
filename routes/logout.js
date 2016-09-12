var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	req.session.destroy();
	res.clearCookie('remember_me', { path: '/' });
	res.redirect('/login');
});

module.exports = router;
