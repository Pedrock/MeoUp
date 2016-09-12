module.exports.server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

module.exports.db_config = {
	host     : process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost',
	user     : process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'DB USERNAME',
	password : process.env.OPENSHIFT_MYSQL_DB_PASSWORD || 'DB PASSWORD',
	port : process.env.OPENSHIFT_MYSQL_DB_PORT,
	database : process.env.OPENSHIFT_APP_NAME || 'DATABASE NAME',
	timezone: 'utc'
};

module.exports.meocloud_consumer_key = 'YOUR CONSUMER KEY';
module.exports.meocloud_consumer_secret = 'YOUR CONSUMER SECRET';

module.exports.session_secret = 'JIDSJIFJISDFV)#(#%#838424JJKSDFDKJF'; // Change to something random
module.exports.cookie_secret = 'JIDSJIFJISDFV)#(#%#838424JJKSDFDKJF'; // Change to something random
