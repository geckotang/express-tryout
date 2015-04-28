'use strict';

// standard module
var path = require('path');
var fs = require('fs');

// npm module
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var args = require('yargs').argv;
var browserSync = require('browser-sync');

// settings
var config = JSON.parse(fs.readFileSync(__dirname+'/config.json'));
var BROWSER_SYNC_RELOAD_DELAY = 500;
var env = args.env || 'development';
var isProd = env === 'production';

gulp.task('default', ['browser-sync']);

gulp.task('browser-sync', ['server'], function() {
	browserSync.init(null, {
		proxy: 'http://localhost:'+config.wwwPort,
    files: [
      config.wwwDir+'/**/*.*'
    ],
    port: config.browserSyncPort
	});
});

gulp.task('server', function (cb) {
  var called = false;
  return nodemon({
    script: config.serverJS,
    watch: [config.serverJS]
  })
  .on('start', function onStart() {
    if (!called) { cb(); }
    called = true;
  })
  .on('restart', function onRestart() {
    setTimeout(function reload() {
      browserSync.reload({
        stream: false
      });
    }, BROWSER_SYNC_RELOAD_DELAY);
  });
});
