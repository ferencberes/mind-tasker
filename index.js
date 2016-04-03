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
		trello.Init(process.argv[2], port);
		my_couchbase.Init();
		is_initialized = true;
		console.log('Moduls were initialized.');
	}
	res.render('index', {title : 'Dashboard'});
});

app.get('/new', trello.login, function (req, res, next) {
	console.log("GET /new");
	trello.syncLatestActions(req, res, next);
	next();
}, function(req, res, next) {
	var skip = req.query.skip;
	var limit = req.query.limit;
	my_couchbase.getLatestActions(req, res, next, skip, limit);
});

app.get('/local', function (req, res, next) {
	console.log("GET /local");
	var skip = req.query.skip;
	var limit = req.query.limit;
	my_couchbase.getLocalActions(req, res, next, skip, limit);
});

app.get('/upcoming', function (req, res, next) {
	console.log("GET /upcoming");
	res.render('index', {title : 'Upcoming Events'});
});

app.get('/trash', function (req, res, next) {
	console.log("GET /trash");
	var skip = req.query.skip;
	var limit = req.query.limit;
	my_couchbase.getTrashActions(req, res, next, skip, limit);
});

app.get('/callback', function (req, res, next) {
	console.log("GET /callback");
	trello.callback(req, res, next);
});

app.param('action_id', my_couchbase.exists_id);

app.param('action_status', my_couchbase.exists_status);

app.get('/update/:action_id/move/:action_status', function (req, res, next) {
	console.log("UPDATE /move");
	var id = req.params.action_id;
	var status = req.params.action_status; 
	console.log('Action ' + id + ' was moved to /' + status);
	res.end();
});

app.get('/update/:action_id/reset', function (req, res, next) {
	console.log("UPDATE /reset");
	var id = req.params.action_id;
	console.log('Action ' + id + ' was reset.');
	res.end();
});

var server = app.listen(port, function() {
	console.log('MindTasker is running on port ' + port);
});