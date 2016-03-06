var express = require('express')
//var trello = require('./trello/trello_utils')
var trello = require('./trello/trello_calls')
var couchbase = require('./couchbase/couchbase_calls').Init();

var app = express()

app.get('/', function (req, res, next) {
	res.send('MindTasker Trials');
});

app.get('/new', function (req, res, next) {
	console.log("GET /new");
	// TODO: inkább majd valamit renderelni kéne...
	trello.getLatestActions(req, res, next);
});

app.get('/local', function (req, res, next) {
	console.log("GET /local");
	res.send('List of all locally stored event...');
});

app.get('/upcoming', function (req, res, next) {
	console.log("GET /upcoming");
	res.send('List of all upcoming events...')
});

app.get('/login', function (req, res, next) {
	console.log("GET /login");
	trello.login(req, res, next);
});

app.get('/callback', function (req, res, next) {
	console.log("GET /callback");
	trello.callback(req, res, next);
});

var server = app.listen(7001, function() {
	console.log('MindTasker is running on port 7001');
});