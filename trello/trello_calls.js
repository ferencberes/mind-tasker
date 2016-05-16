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
var key = "688c96f55f705bc0d73cc0d8a49da479";

var oauth_secrets = {};
var oauth = "";
var token = "";
var tokenSecret = "";
var verifier = "";

exports.Init = function(mySecret, myPort) {
  domain = "127.0.0.1";
  port = myPort;
  loginCallback = "http://" + domain + ":" + port + "/callback";
  secret = mySecret;
  oauth = new OAuth(requestURL, accessURL, key, secret, "1.0", loginCallback, "HMAC-SHA1");
  //console.log(secret);
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
        my_mongo.insertNewEvents(data);
   	});
  });
  console.log('New events were synchronized with database.');
  next();
};