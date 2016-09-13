var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next)
{
	res.render('login', {register: true});
});

router.post('/', function(req, res, next) {
	if (req.session.user !== undefined)
		return res.redirect('/');
	if (req.body.password !== req.body.confirm_password)
		return res.render('login', {register: true, error_message: "Passwords don't match."});
	var username_pattern = new RegExp("^[a-zA-Z]\\w{4,14}$");
	if (!username_pattern.test(req.body.username))
		return res.render('login', {register: true, error_message: 'Invalid username.'});
	if (req.body.password.length < 6)
		return res.render('login', {register: true, error_message: 'Password too short.'});
	var Users = rootRequire('models/users.js');
	Users.create(req.body.username, req.body.password, function(err, result) {
		if (err)
		{
			if (err.code == 'ER_DUP_ENTRY')
				return res.render('login',
					{register: true, error_message: 'Username already exists.'});
			else {
				console.log(JSON.stringify([err, result]));
				return res.render('login', {register: true, error_message: 'An error occurred while creating your account. Please try again.'});
			}
		}
		else
		{
			req.session.user = result.insertId;
			res.redirect('/oauth');
		}
	});
});

module.exports = router;
