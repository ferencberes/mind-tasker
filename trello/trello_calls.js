var OAuth = require('oauth').OAuth;
var url = require('url');
var my_mongo = require('../mongo/mongo_calls');

var requestURL = "https://trello.com/1/OAuthGetRequestToken";
var accessURL = "https://trello.com/1/OAuthGetAccessToken";
var authorizeURL = "https://trello.com/1/OAuthAuthorizeToken";

var domain = "";
var port = "";
var secret = "";
var loginCallback = "";
var appName = "Mind-Tasker";
var key = "";

var oauth_secrets = {};
var oauth = "";
var token = "";
var tokenSecret = "";
var verifier = "";

exports.Init = function(mySecret, myKey, myPort) {
  domain = "127.0.0.1";
  port = myPort;
  loginCallback = "http://" + domain + ":" + port + "/callback";
  secret = mySecret;
  key = myKey;
  oauth = new OAuth(requestURL, accessURL, key, secret, "1.0", loginCallback, "HMAC-SHA1");
};

exports.login = function(req, res, next) {
  if (token == "") {
    console.log('LOGIN NOW')
    return oauth.getOAuthRequestToken((function(_this) {
      return function(error, token, tokenSecret, results) {
        oauth_secrets[token] = tokenSecret;
        res.writeHead(302, {
          'Location': authorizeURL + "?oauth_token=" + token + "&name=" + appName
        });
        return res.end();
      };
    })(this));
  } else {
    console.log('The user is already logged in.');
  }
  next();
};

exports.callback = function(req, res, next) {
  var query;//, token, tokenSecret, verifier;
  query = url.parse(req.url, true).query;
  token = query.oauth_token;
  tokenSecret = oauth_secrets[token];
  verifier = query.oauth_verifier;
  // TODO: save these informations to database table...
  /*
  return oauth.getOAuthAccessToken(token, tokenSecret, verifier, function(error, accessToken, accessTokenSecret, results) {
    return oauth.getProtectedResource("https://api.trello.com/1/members/me", "GET", accessToken, accessTokenSecret, function(error, data, response) {
      return res.end(data);
    });
  });
  */
  console.log('REDIRECT for /sync');
  res.redirect('/sync');
  next();
};

exports.syncLatestActions = function(req, res, next) {
	return oauth.getOAuthAccessToken(token, tokenSecret, verifier, function(error, accessToken, accessTokenSecret, results) {
  	return oauth.getProtectedResource("https://api.trello.com/1/members/me/actions", "GET", accessToken, accessTokenSecret, function(error, data, response) {
        var data_json = JSON.parse(data);
        for (card_id in get_card_ids(data_json)) {
          //console.log(card_id);
          oauth.getProtectedResource("https://api.trello.com/1/cards/" + card_id, "GET", accessToken, accessTokenSecret, function(error, card_str, response) {
            try {
              card = JSON.parse(card_str);
              if ('id' in card) {
                card_wrapper = {'id':card.id, 'date':card.dateLastActivity, 'name':card.name, 'url':card.shortUrl};
                //console.log(card_wrapper);
                my_mongo.upsertAction(card_wrapper, "tr_" + card.id, "trello");
              }; 
            } catch (e) {
              console.log('Resource not available.');
            };
          });
        };
   	});
  });
  console.log('New events were synchronized with database.');
  next();
};

var get_card_ids = function (data_json) {
  var card_ids = {};
  for (idx in data_json) {
    if ('card' in data_json[idx]['data']) {
      card_id = data_json[idx]['data']['card']['id'];
      //console.log(card_id);
      card_ids[card_id] = "1";
    }
  };
  //console.log(card_ids);
  return card_ids;
};

exports.getTrelloCard = function(req, res, next, id) {
  return oauth.getOAuthAccessToken(token, tokenSecret, verifier, function(error, accessToken, accessTokenSecret, results) {
    return oauth.getProtectedResource("https://api.trello.com/1/cards/" + id, "GET", accessToken, accessTokenSecret, function(error, data, response) {
        console.log(data);
    });
  });
  next();
};