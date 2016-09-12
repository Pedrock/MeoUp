var mysql = require('mysql');
var db = mysql.createConnection(rootRequire('config').db_config);

module.exports = db;