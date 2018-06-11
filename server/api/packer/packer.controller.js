'use strict';

var request = require('request');

exports.index = function(req, res) {
  var ua = req.headers['user-agent'];
  var body = req.query;
  packItUp({
    request_uri: body.request_uri,
    request_os: ua,
    request_ip: req.connection.remoteAddress,
    request_mac: body.mac,
    username: body.username,
    ap_mac: body.ap_mac,
    email: body.email,
    locale: req.headers['accept-language']
  },body.api_url);
  res.send(200)
};

function packItUp(json,url) {
  request.post(
    url + '/logins/reporter.json',
    { form: json },
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
      }
    }
  );
}


