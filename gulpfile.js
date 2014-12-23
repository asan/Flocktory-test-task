var gulp = require('gulp');
var concat = require('gulp-concat');
var browserify = require('browserify');
var reactify = require('reactify');
var transform = require('vinyl-transform');

gulp.task('browserify', function () {
  var browserified = transform(function(filename) {
    var b = browserify(filename);
    b.transform(reactify);
    return b.bundle();
  });
  return gulp.src(['./src/js/app.js'])
    .pipe(browserified)
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('copy', function() {
  gulp.src('./src/index.html')
    .pipe(gulp.dest('./dist'));
});

gulp.task('default',['browserify', 'copy']);

gulp.task('watch', function() {
  gulp.watch('./src/**/*.*', ['default']);
});