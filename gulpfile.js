'use strict';

// standard module
var path = require('path');
var fs = require('fs');

// npm module
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var del = require('del');
var plugin = require('gulp-load-plugins')();

// settings
var config = JSON.parse(fs.readFileSync(__dirname+'/config.json'));
var BROWSER_SYNC_RELOAD_DELAY = 500;
var env = args.env || 'development';
var isProd = env === 'production';
var srcDir = {
  pc: './src/pc',
  sp: './src/sp'
};
var destDir = {
  pc: './www',
  sp: './www/s'
};

gulp.task('default', ['browser-sync']);

//PC用HTMLビルド
gulp.task('html:pc', function() {
  var templateData = {},
  options = {
    batch : [srcDir.pc + '/templates/partials'],
    helpers : {}
  };
  return gulp.src(srcDir.pc + '/templates/pages/*.hbs')
    .pipe(plugin.compileHandlebars(templateData, options))
    .pipe(plugin.rename(function(path) {
        path.extname = '.html';
    }))
    .pipe(gulp.dest(destDir.pc));
});

//SP用HTMLビルド
gulp.task('html:sp', function() {
  var templateData = {},
  options = {
    batch : [srcDir.sp + '/templates/partials'],
    helpers : {}
  };
  return gulp.src(srcDir.sp + '/templates/pages/*.hbs')
    .pipe(plugin.compileHandlebars(templateData, options))
    .pipe(plugin.rename(function(path) {
        path.extname = '.html';
    }))
    .pipe(gulp.dest(destDir.sp));
});

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
