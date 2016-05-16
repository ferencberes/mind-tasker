var express = require('express')
var trello = require('./trello/trello_calls');
//var my_mongo = require('./couchbase/couchbase_calls');
var my_mongo = require('./mongo/mongo_calls');

var app = express()
var is_initialized = false;
app.use(express.static('public'));
app.set('view engine','ejs');

var oauth_secret = process.argv[2]
var mongo_port = process.argv[3]
var server_port = process.argv[4]

app.get('/', function (req, res, next) {
	// configure custom modules
	if (!is_initialized) {
		trello.Init(oauth_secret, server_port);
		my_mongo.Init(mongo_port);
		is_initialized = true;
		console.log('Moduls were initialized.');
	}
	res.render('index', {title : 'Dashboard'});
});

app.get('/sync', trello.login, function (req, res, next) {
	console.log("GET /sync");
	trello.syncLatestActions(req, res, next);
	res.redirect('/');
});

app.get('/new', function (req, res, next) {
	console.log("GET /new");
	var skip = req.query.skip;
	var limit = req.query.limit;
	my_mongo.getLatestActions(req, res, next, skip, limit);
});

app.get('/local', function (req, res, next) {
	console.log("GET /local");
	var skip = req.query.skip;
	var limit = req.query.limit;
	my_mongo.getLocalActions(req, res, next, skip, limit);
});

app.get('/upcoming', function (req, res, next) {
	console.log("GET /upcoming");
	res.render('index', {title : 'Upcoming Events'});
});

app.get('/trash', function (req, res, next) {
	console.log("GET /trash");
	var skip = req.query.skip;
	var limit = req.query.limit;
	my_mongo.getTrashActions(req, res, next, skip, limit);
});

app.get('/callback', function (req, res, next) {
	console.log("GET /callback");
	trello.callback(req, res, next);
});

app.param('action_id', my_mongo.existsId);

app.param('action_status', my_mongo.existsStatus);

app.get('/update/:action_id/move/:action_status', function (req, res, next) {
	console.log("UPDATE /move");
	var id = req.params.action_id;
	var status = req.params.action_status; 
	my_mongo.moveAction(req, res, next, id, status);
});

app.get('/update/:action_id/reset', function (req, res, next) {
	console.log("UPDATE /reset");
	var id = req.params.action_id;
	my_mongo.resetAction(req, res, next, id);
});

var server = app.listen(server_port, function() {
	console.log('MindTasker is running on server_port ' + server_port);
});