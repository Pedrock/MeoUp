var db = require(__dirname + '/db.js');

module.exports.create = function(username, password, callback)
{
	db.query('INSERT INTO users(username, password) VALUES (?,UNHEX(SHA1(?)))', [username, password], function(err, results) {
		callback(err, results);
	});
};

module.exports.setToken = function(user_id, token, token_secret, callback)
{
	db.query('UPDATE users SET token = ?, token_secret = ? WHERE id = ?',
		[token, token_secret, user_id], function(err, results) {
			if (err)
				return next(err);
			callback();
		});
};

module.exports.isValidLogin = function(username, password, callback)
{
	db.query('SELECT id FROM users WHERE username = ? AND password = UNHEX(SHA1(?));', [username, password], function(err, results) {
		if (err)
			return next(err);

		if (results[0] !== undefined)
			return callback(results[0].id);
		else
			return callback(null);
	});
};

module.exports.hasOauth = function(session, callback)
{
	if (session.oauth !== undefined)
		return callback(session.oauth);
	db.query('SELECT token, token_secret FROM users WHERE id = ? AND token IS NOT NULL AND token_secret IS NOT NULL;', [session.user], function(err, results) {
		if (err)
			return next(err);
		session.oauth = results[0] !== undefined;
		if (session.oauth)  {
			session.token = results[0].token;
			session.token_secret = results[0].token_secret;
		}
		return callback(session.oauth);
	});
};

module.exports.getAccessToken = function(user_id, callback)
{
	db.query('SELECT token, token_secret FROM users WHERE id = ?;', [user_id], function(err, results) {
		if (err)
			return next(err);
		callback(results[0].token, results[0].token_secret);
	});
};