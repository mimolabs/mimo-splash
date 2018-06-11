'use strict';

var request = require('request');
const queryString = require('query-string');
var errors = require('./components/errors');
var mimo = ['s.oh-mimo.com'];

module.exports = function(app) {

  app.get('/auth/facebook', function(req, res) {
    var redirect_url = 'http://app.my-wifi.co';
    if (mimo.indexOf(req.headers.host) >= 0) {
      redirect_url = 'http://s.oh-mimo.com';
    }

    redirect_url = redirect_url + '/auth/facebook';

    console.log(redirect_url)

    var query = {};
    query.client_id = process.env.CLIENT_ID;
    query.client_secret = process.env.CLIENT_SECRET;
    query.redirect_uri = redirect_url;
    query.code = req.query.code;

    var url = 'https://graph.facebook.com/v2.12/oauth/access_token';
    request({url: url, qs: query}, function(err, response, body) {
      if(err) {
        // We ignore this error and log them in anyway;
        console.log(err);
      }

      var params = new Buffer(req.query.state, 'base64').toString('ascii');
      params = JSON.parse(params);

      // var params = JSON.parse(req.query.state);
      if (response.statusCode !== 200) {
        console.warn(response.statusCode);
      }

      params.type = 'fb';

      if (response.statusCode !== 200) {
        console.log(response.body, response.statusCode);
      }

      if (response.statusCode === 200) {
        var data = JSON.parse(response.body);
        params.code = data.access_token;
      }

      const parsedHash = queryString.stringify(params);
      res.redirect('/social?' + parsedHash);
    });
  });

  app.get('/auth/google/callback', function(req, res) {
    var redirect_url = 'http://app.my-wifi.co';
    if (mimo.indexOf(req.headers.host) >= 0) {
      redirect_url = 'http://s.oh-mimo.com';
    }

    redirect_url = redirect_url + '/auth/google/callback';

    var query = {};
    query.client_id = process.env.GOOGLE_CLIENT_ID;
    query.client_secret = process.env.GOOGLE_CLIENT_SECRET;
    query.redirect_uri = redirect_url;
    query.code = req.query.code;
    query.grant_type = 'authorization_code';

    console.log(query)
    var url = 'https://www.googleapis.com/oauth2/v4/token';
    request.post({url: url, qs: query}, function(err, response, body) {
      if(err) {
        // We ignore this error and log them in anyway;
        console.log(err);
      }

      var params = new Buffer(req.query.state, 'base64').toString('ascii');
      params = JSON.parse(params);

      if (response.statusCode !== 200) {
        console.warn(response.statusCode);
      }

      params.type = 'google';

      if (response.statusCode !== 200) {
        console.log(response.body, response.statusCode);
      }

      if (response.statusCode === 200) {
        var data = JSON.parse(response.body);
        params.code = data.access_token;
        console.log('xxxxxxxxxxxxxxxxxxxxxxxx')
        console.log(params);
        console.log('xxxxxxxxxxxxxxxxxxxxxxxx')
      }

      const parsedHash = queryString.stringify(params);
      res.redirect('/social?' + parsedHash);
    });
  });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
