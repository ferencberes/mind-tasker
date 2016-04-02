var express = require('express')
var trello = require('./trello/trello_calls');
var my_couchbase = require('./couchbase/couchbase_calls');

var app = express()
app.set('view engine','ejs');

var port = process.argv[3]

app.get('/', function (req, res, next) {
	// configure custom modules
	trello.Init(process.argv[2]);
	my_couchbase.Init();
	console.log('Initializations finished.');
	res.render('index', {title : 'MindTasker trials'});
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
	res.send('List of all locally stored event...');
});

app.get('/upcoming', function (req, res, next) {
	console.log("GET /upcoming");
	res.send('List of all upcoming events...'
)});

app.get('/trash', function (req, res, next) {
	console.log("GET /trash");
	res.send('List of all trashed events...')
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