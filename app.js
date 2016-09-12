var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

global.rootRequire = function(name) {
	return require(__dirname + '/' + name);
};

var sessionStore = new MySQLStore({}, rootRequire('./models/db'));

var app = express();

app.use(function(req,res,next){ req.MeoUp = {}; next(); });

app.use(session({
	key: 'session',
	secret: rootRequire('config').session_secret,
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(rootRequire('config').cookie_secret));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', function (req, res) {
	res.writeHead(200);
	res.end();
});
app.use('/info', require('./routes/info'));
app.use('/signature_decoder', require('./routes/signature_decoder'));

app.use('/login', require('./routes/login'));
app.use('/register', require('./routes/register'));

app.use(function(req, res, next) {
	if (req.session.user == null){
		var cookie = req.signedCookies['remember_me'];
		if (cookie !== undefined)
			cookie = JSON.parse(cookie);
		if (cookie !== undefined && cookie['user'] !== undefined && cookie['token'] !== undefined)
		{
			require('./models/login_tokens').exists(cookie['user'], cookie['token'], function(exists) {
				if (exists) {
					req.session.user = cookie['user'];
					next();
				}
				else
					res.redirect('/login');
			});
		}
		else
			res.redirect('/login');
	} else {
		next();
	}
});

app.use('/logout', require('./routes/logout'));

app.use('/oauth', require('./routes/oauth'));

app.use(function(req, res, next) {
	var Users = require('./models/users.js');

	Users.getAccessToken(req.session.user, function(token, token_secret) {
		if (token && token_secret)
		{
			req.MeoUp.token = token;
			req.MeoUp.token_secret = token_secret;
			return next();
		}
		else
			res.redirect('/oauth');
	});
});

app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;
