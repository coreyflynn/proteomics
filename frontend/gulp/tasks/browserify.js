var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');


var basePath = './public/js/';

var bundler = watchify(browserify(basePath + 'app.js', watchify.args));
// add any other browserify options or transforms here
// bundler.transform('brfs');

gulp.task('browserify', bundle); // so you can run `gulp js` to build the file
bundler.on('update', bundle); // on any dep update, runs the bundler

function bundle() {
  return bundler.bundle()
  // log errors if they happen
  .on('error', gutil.log.bind(gutil, 'Browserify Error'))
  .pipe(source('bundle.js'))
  // optional, remove if you dont want sourcemaps
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
  .pipe(sourcemaps.write('./')) // writes .map file
  //
  .pipe(gulp.dest('./public/js/'));
}

module.exports = bundle;
