var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	if (req.session.user !== undefined)
		return res.redirect('/');
	res.render('login');
});

router.post('/', function(req, res, next) {
	if (req.session.user !== undefined)
		return res.redirect('/');

	var Users = rootRequire('models/users.js');
	Users.isValidLogin(req.body.username, req.body.password, function(id) {
		if (id !== null)
		{
			req.session.user = id;

			if (req.body.remember) {
				require('crypto').randomBytes(64, function(err, buffer) {
					var token = buffer.toString('hex');
					rootRequire('models/login_tokens').add(id, token, function() {
						var cookieValue = JSON.stringify({ user: id, token: token});
						res.cookie('remember_me', cookieValue,
							{ expires: new Date('2038-01-01'), path: '/', signed: true});
						res.redirect('/');
					});
				});
			}
			else
				res.redirect('/');
		}
		else
			res.redirect('/login?error');
	});
});

module.exports = router;
