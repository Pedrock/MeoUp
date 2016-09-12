var express = require('express');
var router = express.Router();

var oa = rootRequire('helpers/meocloud.js').OAuth();

router.get('/', function(req, res, next) {
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_access_token_secret){
		req.session.oauth_token = oauth_token;
		req.session.oauth_access_token_secret = oauth_access_token_secret;
		res.render('login_oauth', {authorizeURL: 'https://meocloud.pt/oauth/authorize?oauth_token=' + oauth_token});
	});
});

router.post('/', function(req, res, next) {
	console.log(req.body.pin, req.session.oauth_token, req.session.oauth_access_token_secret);
	oa.getOAuthAccessToken(req.session.oauth_token, req.session.oauth_access_token_secret, req.body.pin,
		function(error, oauth_access_token, oauth_access_token_secret) {

			console.log(error, oauth_access_token, oauth_access_token_secret);

			if (error) {
				console.log(error);
				res.redirect('/');
				return;
			}
			
			var Users = rootRequire('models/users.js');
			Users.setToken(req.session.user, oauth_access_token, oauth_access_token_secret, function() {
				delete req.session.oauth_token;
				delete req.session.oauth_access_token_secret;
				req.session.oauth = true;

				res.redirect('/');
			});
		});
});

module.exports = router;
