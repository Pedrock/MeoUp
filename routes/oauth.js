var express = require('express');
var router = express.Router();

var oa = rootRequire('helpers/meocloud.js').OAuth();

var renderInitialOauthPage = function(req, res, params)
{
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_access_token_secret){
		req.session.oauth_token = oauth_token;
		req.session.oauth_access_token_secret = oauth_access_token_secret;
		if (params === undefined)
			params = {};
		params.authorizeURL = 'https://meocloud.pt/oauth/authorize?oauth_token=' + oauth_token;
		res.render('login_oauth', params);
	});
};

router.get('/', function(req, res, next) {
	renderInitialOauthPage(req, res);
});

router.post('/', function(req, res, next) {
	console.log(req.body.pin, req.session.oauth_token, req.session.oauth_access_token_secret);
	oa.getOAuthAccessToken(req.session.oauth_token, req.session.oauth_access_token_secret, req.body.pin,
		function(error, oauth_access_token, oauth_access_token_secret) {

			console.log(error, oauth_access_token, oauth_access_token_secret);

			if (error) {
				console.log(error);
				if (error.statusCode == 400 && error.data)
					return renderInitialOauthPage(req, res, {error_message: error.data});
				else
					return renderInitialOauthPage(req, res, {error_message: 'Unexpected error occurred. Please try again.'});
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
