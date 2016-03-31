var OAuth = require('oauth').OAuth;
var url = require('url');
var couchbase = require('../couchbase/couchbase_calls');

var domain = "127.0.0.1";
var port = 7001;

var requestURL = "https://trello.com/1/OAuthGetRequestToken";
var accessURL = "https://trello.com/1/OAuthGetAccessToken";
var authorizeURL = "https://trello.com/1/OAuthAuthorizeToken";

var appName = "Mind-Tasker";
var key = "688c96f55f705bc0d73cc0d8a49da479";
var secret = "";
var loginCallback = "http://" + domain + ":" + port + "/callback";

var oauth_secrets = {};
var oauth = "";

var token = "";
var tokenSecret = "";
var verifier = "";

exports.Init = function(mySecret) {
  secret = mySecret;
  oauth = new OAuth(requestURL, accessURL, key, secret, "1.0", loginCallback, "HMAC-SHA1");
  //console.log(secret);
};

exports.login = function(req, res, next) {
  console.log('LOGIN NOW')
  //console.log(secret)
  return oauth.getOAuthRequestToken((function(_this) {
    return function(error, token, tokenSecret, results) {
      oauth_secrets[token] = tokenSecret;
      res.writeHead(302, {
        'Location': authorizeURL + "?oauth_token=" + token + "&name=" + appName
      });
      return res.end();
    };
  })(this));
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
  console.log('REDIRECT for /new');
  res.redirect('/new');
  next();
};

exports.syncLatestActions = function(req, res, next) {
  
  if (token == "") {
		console.log('Token is not initialized. REDIRECT for /login');
		res.redirect('/login');
	} else {
		return oauth.getOAuthAccessToken(token, tokenSecret, verifier, function(error, accessToken, accessTokenSecret, results) {
    		return oauth.getProtectedResource("https://api.trello.com/1/members/me/actions", "GET", accessToken, accessTokenSecret, function(error, data, response) {
            couchbase.insertNewEvents(data);
    		});
  		});
	};
  res.alma = "ALMA";
  console.log('New events were synchronized with database.');
  next();
};