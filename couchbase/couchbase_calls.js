var couchbase = require('couchbase');
var N1qlQuery = require('couchbase').N1qlQuery;
var ViewQuery = couchbase.ViewQuery;

var bucket, cluster, lastUpdate;

exports.Init = function() {
	cluster = new couchbase.Cluster('couchbase://127.0.0.1');
	bucket = cluster.openBucket('trello-actions');
};

exports.insertNewEvents = function (data_str) {
	var data_json = JSON.parse(data_str);
	var currentUpdate = data_json[0]["date"];
	// store 'lastUpdate' in database ad check with break whether there is new info... 
	for (idx in data_json) {
		action = data_json[idx];
		new_id = "tr_" + action["id"];
		bucket.upsert(new_id, action, function(err, result) {
  			if (err) throw err;
  			//console.log("New event inserted into DB.");
		});
	};
	lastUpdate = currentUpdate;
	console.log(lastUpdate);
};

exports.getLatestActions = function (req, res, next, skip, limit) {
	if (skip === undefined) { skip = 0;}
	if (limit === undefined) { limit = 5;}
	var query = ViewQuery.from('dev_trello_action_view','trello_latest_actions').skip(skip).limit(limit);
	bucket.query(query, function(err, results) {
		if (err) {
			console.log(err);
		} else {
			//console.log(results);
			res.render('new',{title: 'New Events', actions : results});
			console.log('Latest actions were rendered: skip=' + skip + ', limit=' + limit);
		};
	});
};