var express = require('express')
var trello = require('./trello/trello_calls');
var my_couchbase = require('./couchbase/couchbase_calls');

var app = express()
var is_initialized = false;
app.use(express.static('public'));
app.set('view engine','ejs');

var port = process.argv[3]

app.get('/', function (req, res, next) {
	// configure custom modules
	if (!is_initialized) {
		trello.Init(process.argv[2]);
		my_couchbase.Init();
		is_initialized = true;
		console.log('Moduls were initialized.');
	}
	res.render('index', {title : 'Dashboard'});
});

app.get('/new', function (req, res, next) {
	console.log("GET /new");
	//trello.syncLatestActions(req, res, next);
	next();
}, function(req, res, next) {
	var skip = req.query.skip;
	var limit = req.query.limit;
	my_couchbase.getLatestActions(req, res, next, skip, limit);
});

app.get('/local', function (req, res, next) {
	console.log("GET /local");
	res.render('index', {title : 'Local Events'});
});

app.get('/upcoming', function (req, res, next) {
	console.log("GET /upcoming");
	res.render('index', {title : 'Upcoming Events'});
});

app.get('/trash', function (req, res, next) {
	console.log("GET /trash");
	res.render('index', {title : 'Trash'});
});

app.get('/login', function (req, res, next) {
	console.log("GET /login");
	trello.login(req, res, next);
});

app.get('/callback', function (req, res, next) {
	console.log("GET /callback");
	trello.callback(req, res, next);
});

var server = app.listen(port, function() {
	console.log('MindTasker is running on port ' + port);
});