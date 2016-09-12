
var db = require(__dirname + '/db.js');

module.exports.fromUser = function(user_id, callback)
{
	db.query('SELECT id,url,filename,downloaded,download_size AS size,status,share_url,last_update ' +
		'FROM downloads ' +
		'WHERE user_id = ?', [user_id], function(err, results) {
		if (err)
			return next(err);
		callback(results);
	});
};

module.exports.create = function(user_id, url, filename, callback)
{
	db.query('INSERT INTO downloads(user_id,url,filename) VALUES (?,?,?)', [user_id, url, filename], function(err, result) {
		if (err)
			return next(err);
		callback(result.insertId);
	});
};

module.exports.getFilename = function(user_id, download_id, callback)
{
	db.query('SELECT filename FROM downloads WHERE id = ? AND user_id = ?', [download_id, user_id], function(err, results) {
		if (err)
			return next(err);
		callback(results);
	});
};

module.exports.delete = function(user_id, download_id, callback)
{
	db.query('DELETE FROM downloads WHERE id = ? AND user_id = ?', [download_id, user_id], function(err, results) {
		if (err)
			return next(err);
		if (callback !== undefined) callback(results);
	});
};

module.exports.updateProgress = function(user_id, download_id, downloaded, download_size, callback)
{
	db.query('UPDATE downloads SET downloaded = ?, download_size = ? WHERE id = ? AND user_id = ?',
		[downloaded,download_size,download_id,user_id], function(err, results) {
		if (err)
			return next(err);
		if (callback !== undefined) callback(results);
	});
};

module.exports.setError = function(user_id, download_id, callback)
{
	db.query('UPDATE downloads SET status = 0, downloaded = download_size WHERE id = ? AND user_id = ?',
		[download_id,user_id], function(err, results) {
			if (err)
				return next(err);
			if (callback !== undefined) callback(results);
		});
};

module.exports.setFinished = function(user_id, download_id, share_url, callback)
{
	db.query('UPDATE downloads SET status = 3, downloaded = download_size, share_url = ? WHERE id = ? AND user_id = ?',
		[share_url,download_id,user_id], function(err, results) {
			if (err)
				return next(err);
			if (callback !== undefined) callback(results);
		});
};

module.exports.getUpdates = function(user_id, timestamp, callback)
{
	db.query('SELECT id,downloaded,download_size AS size,status,share_url,NOW() AS now FROM downloads WHERE last_update > ? AND user_id = ?',
		[timestamp,user_id], function(err, results) {
			if (err)
				return next(err);
			callback(results);
		});
};