'use strict';

var express = require('express');
var controller = require('./packer.controller');

var router = express.Router();

router.post('/', controller.index);

module.exports = router;
