var fs = require('fs');
var gulpConfig = fs.readFileSync('./gulp-config.js','utf8');
eval(gulpConfig); // jshint ignore:line

gulp.task('live', gulpsync.sync(['set-live-mode','rebuild']) , function() {
  gutil.log(gutil.colors.bold('launching server process...'));
  exec('node app.js');
  
  browserSync.init({
      open:false,
      proxy:'localhost:8181',
      port:7171,
      files: './dist/**/*'
  });
});

gulp.task('apps', function() {
  var bundles = [];
  for(var i = 0; i < appFiles.length; i++){
    bundles.push(compile(appFiles[i]));
  }
  return merge(bundles);
});

gulp.task('views', function() {
  if(LIVE){
    watchViews();
  }
  else{
    return buildViews();
  }
});

gulp.task('clean', function() {
  return del([
    './browserify-cache.json',
    './dist/**/*'
  ]);
});

gulp.task('static',['copy-bootstrap.native'], function() {
  return gulp.src(['./src/static/**/*']).pipe(gulp.dest('./dist/assets/'));
});
