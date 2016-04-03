var Promise = require('promise');
var couchbase = require('couchbase');
var N1qlQuery = require('couchbase').N1qlQuery;
var ViewQuery = couchbase.ViewQuery;

var bucket, cluster, lastUpdate;

exports.Init = function() {
	cluster = new couchbase.Cluster('couchbase://127.0.0.1');
	bucket = cluster.openBucket('trello-actions');
};

var idExistsPromise = function(action_id) {
	return new Promise(function (resolve, reject) {
		bucket.get(action_id, function(err, result) {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
};

exports.existsId = function(req, res, next, action_id) {
	idExistsPromise(action_id).then(
		function(action) {
			console.log(action);
			console.log('ActionID:' + action_id);
			res.end();
			//next();
		},
		function(err) {
			console.log('Invalid action_id!');
			res.sendStatus(400);
		}
	).catch(function(e){console.error(e);});
};

exports.existsStatus = function(req, res, next, status) {
	if (status=='new' || status=='local' || status=='trash') {
		next();
	} else {
		console.log('Invalid action_status!');
		res.sendStatus(400);
	} 
};

var syncNewEvent = function(action_str) {
	action_id = "tr_" + action_str["id"];
	idExistsPromise(action_id).then(
		function(action) {
			console.log('upsert');
			upsertAction(action_id, action_str, 'trello', action.value.status, action.value.old_status);
		},
		function(err) {
			console.log('insert');
			upsertAction(action_id, action_str, 'trello', 'new', 'new');
		}
	).catch(function(e){console.error(e);});
};

var upsertAction = function(id, action_str, service_str, status_str, old_status_str) {
	//console.log(id, action_str, service_str, status_str, old_status_str);
	bucket.upsert(id, {date: action_str.date, service: service_str, status: status_str, old_status: old_status_str, content: action_str}, function(err, result) {
  		if (err) { 
  			console.log(err);
  			throw err;
  		}
	});
};

exports.insertNewEvents = function (data_str) {
	var data_json = JSON.parse(data_str);
	var currentUpdate = data_json[0]["date"];
	// store 'lastUpdate' in database ad check with break whether there is new info... 
	for (idx in data_json) {
		action = data_json[idx];
		syncNewEvent(action);
	};
	lastUpdate = currentUpdate;
	console.log(lastUpdate);
};

var updateAction = function (req, res, next, id, action, changes) {
	updated_action = action;
	for (item in changes) {
		updated_action[item] = changes[item];
	}	
	bucket.replace(id, updated_action, function (err, result) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			console.log('Update operation was succesful.', result);
			res.json(result);
			next();
		};
	});
};

var moveFromToAction = function (req, res, next, id, status, is_reset) {
	bucket.get(id, function(err, result) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			action = result.value;
			changes = {};
			if (is_reset) {
				changes.status = action.old_status;
			} else {
				changes.status = status;
				changes.old_status = action.status;
			}
			updateAction(req, res, next, id, action, changes);
		};
	});
};

exports.moveAction = function (req, res, next, id, status) {
	moveFromToAction(req, res, next, id, status, false);
}

exports.resetAction = function (req, res, next, id) {
	moveFromToAction(req, res, next, id, undefined, true);
}

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