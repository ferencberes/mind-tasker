var express = require('express')
//var trello = require('./trello/trello_utils')
var trello = require('./trello/trello_calls');
var my_couchbase = require('./couchbase/couchbase_calls');

var app = express()

app.set('view engine','ejs');
//app.use(express.bodyParser());

var port = process.argv[3]
trello.Init(process.argv[2]);

app.get('/', function (req, res, next) {
	// configure custom modules
	my_couchbase.Init();
	res.render('index', {title : 'MindTasker trials'});
});

app.get('/new', function (req, res, next) {
	console.log("GET /new");
	trello.syncLatestActions(req, res, next);
	my_couchbase.getLatestActions(req, res, next);
	console.log(res.actions);
}, function(req, res) { res.sendStatus(200); });

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