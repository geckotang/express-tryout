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
var runSequence = require('run-sequence');
var plugin = require('gulp-load-plugins')();

// settings
var handlebarsLayoutsHelper = __dirname + '/node_modules/handlebars-layouts/dist/handlebars-layouts.js';
var config = JSON.parse(fs.readFileSync(__dirname+'/config.json'));
var BROWSER_SYNC_RELOAD_DELAY = 500;
var env = args.env || 'development';
var isProd = env === 'production';
var supportBrowsers = [ 'ie >= 10', 'ios >= 7', 'android >= 4.0' ];
var srcDir = {
  common : __dirname + '/src/common',
  pc     : __dirname + '/src/pc',
  sp     : __dirname + '/src/sp'
};
var destDir = {
  common : __dirname + '/www/common',
  pc     : __dirname + '/www',
  sp     : __dirname + '/www/s'
};

gulp.task('default', ['browser-sync']);

gulp.task('clean', function(cb) {
  del(destDir.pc, { force: true }, cb);
});

//PC用Sass
gulp.task('sass:pc', function() {
  return gulp.src(srcDir.pc + '/styles/**/*.scss')
    .pipe(plugin.plumber())
    .pipe(plugin.sass({
      errLogToConsole: true
    }))
    .pipe(plugin.autoprefixer(supportBrowsers))
    .pipe(plugin.chmod(644))
    .pipe(plugin.if(isProd, plugin.filter(['*', '!*.map'])))
    .pipe(gulp.dest(destDir.pc + '/styles'))
    .pipe(plugin.if(isProd, plugin.minifyCss()))
    .pipe(plugin.if(isProd, plugin.rename({ extname: '.min.css' })))
    .pipe(plugin.if(isProd, gulp.dest(destDir.pc + '/styles')));
});

//SP用Sass
gulp.task('sass:sp', function() {
  return gulp.src(srcDir.sp + '/styles/**/*.scss')
    .pipe(plugin.plumber())
    .pipe(plugin.sass({
      errLogToConsole: true
    }))
    .pipe(plugin.autoprefixer(supportBrowsers))
    .pipe(plugin.chmod(644))
    .pipe(plugin.if(isProd, plugin.filter(['*', '!*.map'])))
    .pipe(gulp.dest(destDir.sp + '/styles'))
    .pipe(plugin.if(isProd, plugin.minifyCss()))
    .pipe(plugin.if(isProd, plugin.rename({ extname: '.min.css' })))
    .pipe(plugin.if(isProd, gulp.dest(destDir.sp + '/styles')));
});

gulp.task('sass', ['sass:pc', 'sass:sp']);

//PC用HTMLビルド
gulp.task('html:pc', function() {
  return gulp.src(srcDir.pc + '/templates/pages/*.hbs')
    .pipe(plugin.hb({
      data: srcDir.pc + '/templates/data/**/*.{js,json}',
      helpers: [
        handlebarsLayoutsHelper,
        srcDir.pc + '/templates/helpers/*.js'
      ],
      partials: srcDir.pc + '/templates/partials/**/*.hbs'
    }))
    .pipe(plugin.rename(function(path) {
      path.extname = '.html';
    }))
    .pipe(gulp.dest(destDir.pc));
});

//SP用HTMLビルド
gulp.task('html:sp', function() {
  return gulp.src(srcDir.sp + '/templates/pages/*.hbs')
    .pipe(plugin.hb({
      data: srcDir.sp + '/templates/data/**/*.{js,json}',
      helpers: [
        handlebarsLayoutsHelper,
        srcDir.sp + '/templates/helpers/*.js'
      ],
      partials: srcDir.sp + '/templates/partials/**/*.hbs'
    }))
    .pipe(plugin.rename(function(path) {
      path.extname = '.html';
    }))
    .pipe(gulp.dest(destDir.sp));
});

gulp.task('html', ['html:pc', 'html:sp']);

//PC/SP用共通ファイルコピー
gulp.task('common', function() {
  return gulp.src(srcDir.common + '/**/*')
    .pipe(gulp.dest(destDir.common));
});

//PC用JSコピー
gulp.task('scripts:pc', function() {
  return gulp.src(srcDir.pc + '/scripts/**/*')
    .pipe(gulp.dest(destDir.pc + '/scripts'));
});

//SP用JSコピー
gulp.task('scripts:sp', function() {
  return gulp.src(srcDir.sp + '/scripts/**/*')
    .pipe(gulp.dest(destDir.sp + '/scripts'));
});

gulp.task('scripts', ['scripts:pc', 'scripts:sp']);

//PC用画像コピー
gulp.task('images:pc', function() {
  return gulp.src(srcDir.pc + '/images/**/*')
    .pipe(gulp.dest(destDir.pc + '/images'));
});

//SP用画像コピー
gulp.task('images:sp', function() {
  return gulp.src(srcDir.sp + '/images/**/*')
    .pipe(gulp.dest(destDir.sp + '/images'));
});

gulp.task('images', ['images:pc', 'images:sp']);

//ビルドタスク
gulp.task('build', function(cb) {
  runSequence('clean', ['sass', 'html', 'scripts', 'images', 'common'], cb);
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
