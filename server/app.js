'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var fs  = require("fs");
var express = require('express');
var config = require('./config/environment');
var oauth = require('oauth');
var app = express();
var server = require('http').createServer(app);
var session = require('express-session');
const queryString = require('query-string');
const callback_url = process.env.TWITTER_CALLBACK || "http://app.my-wifi.test:9001/auth/twitter/callback";

require('./config/express')(app);

app.use(session({
  secret: 'keyboard cat',
  cookie: {}
}))

var consumer = new oauth.OAuth(
  "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
  (process.env.TWITTER_CONSUMER_KEY || '123'), (process.env.TWITTER_CONSUMER_SECRET || '123'), "1.0A", callback_url, "HMAC-SHA1");

function validate(req, res, cb) {
  consumer.get("https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true&include_email=true", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
    if (error) {
      return cb();
    }
    var parsedData = JSON.parse(data);
    return cb(parsedData);
  });
}

app.get('/auth/twitter', function(req, res) {
  req.session.state = req.query.state;
  consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      res.send("Error getting OAuth request token. Please contact support or try again.");
    } else {
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://twitter.com/oauth/authorize?oauth_token="+oauthToken);
    }
  });
});

app.get('/auth/twitter/callback', function(req, res) {
  consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth access token. Please contact support or try again.");
    } else {
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;

      if (!req.session.state) {
        res.redirect('/');
        return;
      }

      validate(req, res, function(data) {
        var state = JSON.parse(req.session.state);
        state.type        = 'tw';
        state.screen_name = data.screen_name;
        state.email       = data.email

        var paramsHash = queryString.stringify(state);
        res.redirect('/social?' + paramsHash);
      });
    }
  });
});

require('./routes')(app);

server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

exports = module.exports = app;
