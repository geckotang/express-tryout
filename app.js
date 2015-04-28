'use strict';

var config = require('./config.json');
var express = require('express');
var basicAuth = require("basic-auth-connect");
var port = process.env.PORT || config.wwwPort;
var app = module.exports = express();

if (config.basicAuth) {
  app.use(basicAuth(function(user, pass){
    return config.basicAuth[user] && config.basicAuth[user] === pass;
  }));
}
app.use(express.static(config.wwwDir));
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});
