var couchbase = require('couchbase');

var bucket, cluster, lastUpdate;

exports.Init = function() {
	cluster = new couchbase.Cluster('couchbase://127.0.0.1');
	bucket = cluster.openBucket('default');
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

exports.getLatestActions = function (req, res, next) {
	var begin_skip = 0;
	var limit_num = 10;
	var query = couchbase.ViewQuery.from('default', 'ID').skip(begin_skip).limit(limit_num);
	bucket.query(query, function(err, results) {
		res.actions = results; // if null then set 404 status
	});
	console.log('Latest actions were queried.')
	next();
};