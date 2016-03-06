var babelify = require('babelify');
var browserify = require('browserify');
var browserifyInc = require('browserify-incremental');
var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var sassify = require('sassify');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var path = require('path');
var del = require('del');
var watchify = require('watchify');
var browserSync = require('browser-sync').create();
var jade = require('gulp-jade');
var glob = require('glob');
var merge = require('merge-stream');
var watch = require('gulp-watch');
var exec = require('child_process').exec;

var appFiles = glob("./src/apps/*.jsx", {sync:true});

var LIVE = false;
var DEBUG = true;
process.env.NODE_ENV = 'development';

const modulePaths = [
  './node_modules',
  './src/components',
  './src/modules',
  './src/sass'
];

var jadeGlobPattern = [
  './src/views/**/*.jade',
  '!./src/views/templates/**/*.jade'
];

function watchViews(){
  watch(jadeGlobPattern,function(){
    buildViews();
  });
}

function buildViews(){
  return gulp.src(jadeGlobPattern)
    .pipe(jade({
      client: false
    }))
    .pipe(gulp.dest('./dist/'));
}

function compile(appPath) {
  var moduleExt = path.extname(appPath);
  var moduleName = path.basename(appPath, moduleExt);
  var outputName = moduleName + '.js';
  var props = {
    debug: DEBUG,
    extensions: ['.js', '.jsx', 'scss'],
    entries: [require.resolve("babel-polyfill"),appPath],
    paths: modulePaths,
    cache: {},
    packageCache: {},
    fullPaths: true,
    baseDir: __dirname
  };

  var bundle = LIVE ? watchify(browserify(props)) : browserify(props);

  function writeBundle() {
    return bundle.bundle()
      .on("error", (e) => gutil.log(e.message))
      .pipe(source(outputName))
      .pipe(gulpif(!DEBUG, streamify(uglify())))
      .pipe(gulp.dest('./dist/assets/js'));
  }

  bundle
    .on("file", (file) => gutil.log('\t', gutil.colors.yellow("Building"), gutil.colors.bold(path.relative(__dirname,file))))
    .transform(sassify, {
      'auto-inject': true,
      base64Encode: false,
      sourceMap: DEBUG
    })
    .transform(babelify, {
      presets: ['babel-preset-es2015', 'babel-preset-react']
    });

  browserifyInc(bundle, {
    cacheFile: './browserify-cache.json'
  });

  if (LIVE) {
    bundle.on("update", (file) => {
      gutil.log('Updating ' + file);
      writeBundle();
    });
  }

  return writeBundle();
}

gulp.task('rebuild', gulpsync.sync(['clean', 'build']), function() {

});

gulp.task('build', gulpsync.sync(['print-mode', 'views', 'static', 'apps']), function() {

});

gulp.task('default', ['build'], function() {

});

gulp.task('production', function() {
  DEBUG = false;
  process.env.NODE_ENV = 'production';
});

gulp.task('print-mode', function() {
  var mode;

  if (DEBUG) {
    mode = gutil.colors.yellow('DEVELOPMENT');
  } else {
    mode = gutil.colors.red('PRODUCTION');
  }

  gutil.log('');
  gutil.log('-->', mode, gutil.colors.bold(' MODE'), '<--');
  gutil.log('');
});

gulp.task('set-live-mode',function(){
  LIVE = true;
  DEBUG = true;
  process.env.NODE_ENV = 'development';
});

gulp.task('copy-bootstrap.native',function(){
  return gulp.src(['./node_modules/bootstrap.native/assets/**/*']).pipe(gulp.dest('./dist/assets/'));
});
