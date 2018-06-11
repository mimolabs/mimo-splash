/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');

var request = require('request');

// Get list of things
exports.index = function(req, res) {
  var ua = req.headers['user-agent'];
  console.log(ua)

  packItUp({
    request_uri: req.body.request_uri,
    location_id: req.body.location_id,
    request_os: ua,
    request_ip: req.connection.remoteAddress,
    request_mac: req.body.mac,
    username: req.body.username,
    ap_mac: req.body.ap_mac,
    email: req.body.email
  },'http://127.0.0.1:8080');
  res.send(200)
};

function packItUp(json,url) {
  console.log(json);
  request.post(
    url + '/api/v1/logins/reporter.json',
    { form: json },
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
      }
    }
  );
}

