var querystring = require('querystring');
var request = require('request');
var progress = require('request-progress');

var OAUTH_VERSION = '1.0';
var SIGNATURE_METHOD = 'HMAC-SHA1';

var api_config = {
	api : {
		root : "sandbox",
		storage : "/1",
		endpoint : "https://api.meocloud.pt/1/",
		content_endpoint : "https://api-content.meocloud.pt/1/"
	},
	oauth : {
		request_token_endpoint : "https://meocloud.pt/oauth/request_token",
		access_token_endpoint : "https://meocloud.pt/oauth/access_token",
		consumer_key : rootRequire('config').meocloud_consumer_key,
		consumer_secret : rootRequire('config').meocloud_consumer_secret
	}
};

module.exports.api_config = api_config;

module.exports.OAuth = function() {
	var OAuth = require('oauth-libre').OAuth;
	return new OAuth(api_config.oauth.request_token_endpoint, api_config.oauth.access_token_endpoint,
		api_config.oauth.consumer_key, api_config.oauth.consumer_secret, OAUTH_VERSION, 'oob', SIGNATURE_METHOD);
};

module.exports.MeoCloud = function(config) {
	var this_config = Object.assign({}, api_config);
	this_config.oauth.token = config.token;
	this_config.oauth.token_secret = config.token_secret;

	var api_endpoint = this_config.api.endpoint;
	var api_content_endpoint = this_config.api.content_endpoint;
	var storage_root = this_config.api.root;

	var getOptions = function(request_method, endpoint, params) {
		params = params !== undefined ? params : {};

		var options = {
			oauth : this_config.oauth,
			method : request_method,
			uri : endpoint,
			timeout : 0
		};

		var qstring = querystring.stringify(params);

		if (options.method === "post")
			options.form = qstring;
		else
			options.uri += ((qstring !== "") ? ["?", qstring].join("") : qstring);

		return options;
	};

	this.accountInfo = function(callback) {
		request(getOptions("get", [api_endpoint, "Account/Info"].join("")),
			function(error, response, body) {
				callback(body);
		});
	};

	this.getUploadPipe = function(path, callback)
	{
		if (path && !path.startsWith('/')) path = '/' + path;
		return request(getOptions("put", [api_content_endpoint, "Files/", storage_root, path].join(""), callback));
	};

	this.share = function(path, callback)
	{
		if (path && !path.startsWith('/')) path = '/' + path;
		request(getOptions("post", [api_content_endpoint, "Shares/", storage_root, path].join("")),
			function(error, response, body) {
				callback(body);
			});
	};

	this.delete = function(path, callback)
	{
		if (path && !path.startsWith('/')) path = '/' + path;
		request(getOptions("post", [api_content_endpoint, "Fileops/Delete"].join(""), {root: storage_root, path: path}),
			function(error, response, body) {
				if (callback !== undefined)
					callback(body);
			});
	};
};