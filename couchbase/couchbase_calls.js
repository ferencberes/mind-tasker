var couchbase = require('couchbase');
var N1qlQuery = require('couchbase').N1qlQuery;
var ViewQuery = couchbase.ViewQuery;

var bucket, cluster, lastUpdate;

exports.Init = function() {
	cluster = new couchbase.Cluster('couchbase://127.0.0.1');
	bucket = cluster.openBucket('trello-actions');
};

exports.exists_id = function(req, res, next, id) {
	bucket.get(id, function(err, result) {
		if (err) {
			console.log('Invalid action_id!');
			res.sendStatus(400);
		} else {
			console.log('ActionID:' + id);
			next();
		}
	});
};

exports.exists_status = function(req, res, next, status) {
	if (status=='new' || status=='local' || status=='trash') {
		next();
	} else {
		console.log('Invalid action_status!');
		res.sendStatus(400);
	} 
};

exports.insertNewEvents = function (data_str) {
	var data_json = JSON.parse(data_str);
	var currentUpdate = data_json[0]["date"];
	// store 'lastUpdate' in database ad check with break whether there is new info... 
	for (idx in data_json) {
		action = data_json[idx];
		new_id = "tr_" + action["id"];
		bucket.upsert(new_id, {date: action.date, service: "trello", status: 'new', old_status: 'new', content: action}, function(err, result) {
  			if (err) { 
  				console.log(err);
  				throw err;
  			}
  			//console.log("New event inserted into DB.");
		});
	};
	lastUpdate = currentUpdate;
	console.log(lastUpdate);
};

exports.getLatestActions = function (req, res, next, skip, limit) {
	if (skip === undefined) { skip = 0;}
	if (limit === undefined) { limit = 5;}
	var query = ViewQuery.from('dev_trello_action_view','trello_latest_actions').order(2).skip(skip).limit(limit);
	bucket.query(query, function(err, results) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			//console.log(results);
			res.render('base_action_list',{title: 'New Events', actions : results});
			console.log('Latest actions were rendered: skip=' + skip + ', limit=' + limit);
		};
	});
};

exports.getLocalActions = function (req, res, next, skip, limit) {
	if (skip === undefined) { skip = 0;}
	if (limit === undefined) { limit = 5;}
	var query = ViewQuery.from('dev_trello_action_view','trello_local_view').order(2).skip(skip).limit(limit);
	bucket.query(query, function(err, results) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			//console.log(results);
			res.render('base_action_list',{title: 'Local Events', actions : results});
			console.log('Local actions were rendered: skip=' + skip + ', limit=' + limit);
		};
	});
};

exports.getTrashActions = function (req, res, next, skip, limit) {
	if (skip === undefined) { skip = 0;}
	if (limit === undefined) { limit = 5;}
	var query = ViewQuery.from('dev_trello_action_view','trello_trash_view').order(2).skip(skip).limit(limit);
	bucket.query(query, function(err, results) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			//console.log(results);
			res.render('base_action_list',{title: 'Trash', actions : results});
			console.log('Trash actions were rendered: skip=' + skip + ', limit=' + limit);
		};
	});
};