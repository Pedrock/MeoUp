var db = require(__dirname + '/db.js');

module.exports.add = function(user_id, token, callback)
{
	db.query('INSERT INTO login_tokens (user_id,token) VALUES(?,?)', [user_id, token], function(err, results) {
		if (err)
			return next(err);
		callback(results);
	});
};

module.exports.exists = function(user_id, token, callback)
{
	db.query('SELECT * FROM login_tokens WHERE user_id = ? AND token = ?', [user_id, token], function(err, results) {
		if (err)
			return next(err);
		callback(results[0] !== undefined);
	});
};