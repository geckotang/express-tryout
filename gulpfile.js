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

plugin.help(gulp);

gulp.task('default', 'Run build task', ['build']);

gulp.task('clean', 'Clean dest files', function(cb) {
  del(destDir.pc, { force: true }, cb);
});

gulp.task('sass:pc', 'Build CSS files for PC', function() {
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

gulp.task('sass:sp', 'Build CSS files for SP', function() {
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

gulp.task('sass', 'Build CSS files', ['sass:pc', 'sass:sp']);

gulp.task('html:pc', 'Build HTML files for PC w/ Handlebars', function() {
  return gulp.src(srcDir.pc + '/templates/pages/*.hbs')
    .pipe(plugin.hb({
      data: srcDir.pc + '/templates/data/**/*.{js,json}',
      helpers: [
        handlebarsLayoutsHelper,
        srcDir.pc + '/templates/helpers/*.js'
      ],
      partials: srcDir.pc + '/templates/partials/**/*.hbs',
      bustCache: true
    }))
    .pipe(plugin.rename(function(path) {
      path.extname = '.html';
    }))
    .pipe(gulp.dest(destDir.pc));
});

gulp.task('html:sp', 'Build HTML files for PC w/ Handlebars', function() {
  return gulp.src(srcDir.sp + '/templates/pages/*.hbs')
    .pipe(plugin.hb({
      data: srcDir.sp + '/templates/data/**/*.{js,json}',
      helpers: [
        handlebarsLayoutsHelper,
        srcDir.sp + '/templates/helpers/*.js'
      ],
      partials: srcDir.sp + '/templates/partials/**/*.hbs',
      bustCache: true
    }))
    .pipe(plugin.rename(function(path) {
      path.extname = '.html';
    }))
    .pipe(gulp.dest(destDir.sp));
});

gulp.task('html', 'Build HTML files w/ Handlebars', ['html:pc', 'html:sp']);

gulp.task('common', 'Copy common files', function() {
  return gulp.src(srcDir.common + '/**/*')
    .pipe(gulp.dest(destDir.common));
});

gulp.task('scripts:pc', 'Copy JavaScript files for PC', function() {
  return gulp.src(srcDir.pc + '/scripts/**/*')
    .pipe(gulp.dest(destDir.pc + '/scripts'));
});

gulp.task('scripts:sp', 'Copy JavaScript files for SP', function() {
  return gulp.src(srcDir.sp + '/scripts/**/*')
    .pipe(gulp.dest(destDir.sp + '/scripts'));
});

gulp.task('scripts', 'Copy JavaScript files', ['scripts:pc', 'scripts:sp']);

gulp.task('images:pc', 'Copy images for PC', function() {
  return gulp.src(srcDir.pc + '/images/**/*')
    .pipe(gulp.dest(destDir.pc + '/images'));
});

gulp.task('images:sp', 'Copy images for SP', function() {
  return gulp.src(srcDir.sp + '/images/**/*')
    .pipe(gulp.dest(destDir.sp + '/images'));
});

gulp.task('images', 'Copy images', ['images:pc', 'images:sp']);

gulp.task('build', 'Build all assets', function(cb) {
  runSequence('clean', ['sass', 'html', 'scripts', 'images', 'common'], cb);
});

gulp.task('browser-sync', 'Run browserSync w/ proxy local server', ['server'], function() {
  browserSync.init(null, {
    proxy: 'http://localhost:'+config.wwwPort,
    files: [
      config.wwwDir+'/**/*.*'
    ],
    port: config.browserSyncPort
  });
});

gulp.task('watch', 'Watch changed files', function () {
  //共通watch
  plugin.watch([srcDir.common+'/**/*'], function(e){
    gulp.start(['common']);
  });
  //PC用watch
  plugin.watch([srcDir.pc+'/styles/**/*.scss'], function(e){
    gulp.start(['sass:pc']);
  });
  plugin.watch([srcDir.pc+'/scripts/**/*'], function(e){
    gulp.start(['scripts:pc']);
  });
  plugin.watch([srcDir.pc+'/images/**/*'], function(e){
    gulp.start(['images:pc']);
  });
  plugin.watch([srcDir.pc+'/templates/**/*'], function(e){
    gulp.start(['html:pc']);
  });
  //SP用watch
  plugin.watch([srcDir.sp+'/styles/**/*.scss'], function(e){
    gulp.start(['sass:sp']);
  });
  plugin.watch([srcDir.sp+'/scripts/**/*'], function(e){
    gulp.start(['scripts:sp']);
  });
  plugin.watch([srcDir.sp+'/images/**/*'], function(e){
    gulp.start(['images:sp']);
  });
  plugin.watch([srcDir.sp+'/templates/**/*'], function(e){
    gulp.start(['html:sp']);
  });
});

gulp.task('server', 'Run server', ['build', 'watch'], function (cb) {
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
