'use strict';

var config = require('./config.json');
var express = require('express');
var basicAuth = require("basic-auth-connect");
var port = process.env.PORT || config.wwwPort;
var BASIC_AUTH_USER = process.env.BASIC_AUTH_USER || '';
var BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || '';
var app = module.exports = express();

if (BASIC_AUTH_USER && BASIC_AUTH_PASSWORD) {
  app.use(basicAuth(BASIC_AUTH_USER, BASIC_AUTH_PASSWORD));
}
app.use(express.static(config.wwwDir));
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});
