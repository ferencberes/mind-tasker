var mongoose = require('mongoose');
var async = require('async');

var Events

exports.Init = function(mongo_port) {
	mongoose.connect('mongodb://localhost:' +  mongo_port + '/mind-tasker');
	Events = mongoose.model('Events', {_id: String, date: String, service: String, status: String, old_status : String, content: Object});
};

var idExistsPromise = function(action_id) {
	return new Promise(function (resolve, reject) {
		Events.count({'_id': action_id }, function (err, count) {
			if (count > 0) {
				resolve();
			} else {
				reject();
			}
		});
	});
};

exports.existsId = function(req, res, next, action_id) {
	idExistsPromise(action_id).then(
		function() {
			console.log('ActionID:' + action_id);
			next();
		},
		function() {
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

exports.insertNewEvents = function (data_str) {
	var data_json = JSON.parse(data_str);
	// serial for loop
	(function myLoop (i) {          
   		setTimeout(function () {             
      		if (--i) {
				upsertAction(data_json[i])      
      			myLoop(i);
      		}
      	}, 50)
	})(data_json.length);
};

// Event operations

var strToDate = function (str_date) {
	return str_date.substring(0,10) + " " + str_date.substring(11,19);
}

var upsertAction = function(action_str) {
	action_id = "tr_" + action_str["id"];
	Events.count({'_id': action_id }, function (err, count) {
  		if (err) console.log(err);

  		if (count>0) {
  			console.log('upsert');
  			Events.findOne({'_id': action_id }, function (err, action) {
				action.date = strToDate(action_str.date);
				action.content = action_str;
				action.save();
			});
  		} else {
  			console.log('insert');
  			var new_event = new Events({_id: action_id, date: strToDate(action_str.date), service: 'trello', status: 'new', old_status: 'new', content: action_str})
			new_event.save(function (err) {
  				if (err) {
    			console.log(err);
  				} else {
    				console.log('New document was added to docs.');
  				}
			});
  		}
  	});
};

exports.moveAction = function (req, res, next, id, new_status) {
	Events.findOne({'_id': id }, function (err, action) {
		if (err) { console.log(err);}
		action.old_status = action.status
		action.status = new_status
		action.save();
	});
	console.log('Action ' + id + ' was moved to /' + new_status);
	res.redirect(req.get('referer'));
};

exports.resetAction = function (req, res, next, id) {
	Events.findOne({'_id': id }, function (err, action) {
		if (err) { console.log(err);}
		action.status = action.old_status
		action.save();
	});
	console.log('Action ' + id + ' was reset.');
	res.redirect(req.get('referer'));
};

exports.removeAction = function (req, res, next, id) {
	Events.findOne({'_id': id }, function (err, action) {
		if (err) { console.log(err);}
		action.remove();
	});
	console.log('Action ' + id + ' was removed.');
	res.redirect(req.get('referer'));
}

// View handler functions

var getSkipValue = function (skip) {
	if (skip === undefined) { 
		skip = 0;
	} else { 
		skip = parseInt(skip);
	}
	return skip;
}

var getLimitValue = function (limit) {
	if (limit === undefined) { 
		limit = 10;
	} else { 
		limit = parseInt(limit);
	}
	return limit;
}

exports.getLatestActions = function (req, res, next, skip, limit) {
	skip = getSkipValue(skip);
	limit = getLimitValue(limit);
	var query = Events.find({ 'status': 'new' }).sort({date : -1}).skip(skip).limit(limit);
	query.exec(function(err, results) {
		if (err) { console.log(err);}
		res.render('new',{title: 'New Events', actions : results});
	});
};

exports.getLocalActions = function (req, res, next, skip, limit) {
	skip = getSkipValue(skip);
	limit = getLimitValue(limit);
	var query = Events.find({ 'status': 'local' }).sort({date : -1}).skip(skip).limit(limit);
	query.exec(function(err, results) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			//console.log(results);
			res.render('local',{title: 'Local Events', actions : results});
			console.log('Local actions were rendered: skip=' + skip + ', limit=' + limit);
		};
	});
};

exports.getTrashActions = function (req, res, next, skip, limit) {
	skip = getSkipValue(skip);
	limit = getLimitValue(limit);
	var query = Events.find({ 'status': 'trash' }).sort({date : -1}).skip(skip).limit(limit);
	query.exec(function(err, results) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			//console.log(results);
			res.render('trash',{title: 'Trash', actions : results});
			console.log('Trash actions were rendered: skip=' + skip + ', limit=' + limit);
		};
	});
};
