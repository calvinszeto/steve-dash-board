var gulp = require('gulp');
var del = require('del');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var cssmin = require('gulp-cssmin');
var rev = require('gulp-rev');
var babel = require('gulp-babel');
var awspublish = require('gulp-awspublish');
var merge = require('merge-stream');
var secrets = require('./secrets.json');

gulp.task('clean', function() {
  return del(['dist/**/*', '.tmp/**/*']);
});

gulp.task('copy', ['clean'], function() {
  return gulp.src(['./assets/images/**/*', './assets/fonts/**/*'], {base: './assets'})
    .pipe(gulp.dest('./dist/'));
});

gulp.task('usemin', ['clean'], function() {
  return gulp.src('./index.html')
    .pipe(usemin({
      css: [ cssmin(), rev() ],
      html: [ function () {return htmlmin({ collapseWhitespace: true });} ],
      js: [ babel({ presets: ['es2015']}), uglify(), rev() ]
    }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['usemin', 'copy']);

gulp.task('default', ['build']);

gulp.task('deploy', ['build'], function() {
  var publisher = awspublish.create({
    params: {
      Bucket: secrets.s3.bucketname
    },
    accessKeyId: secrets.s3.key,
    secretAccessKey: secrets.s3.secret
  });

  var assetHeaders = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };
  var normalHeaders = {
    'Cache-Control': 'max-age=0'
  }

  var assets = gulp.src(['./dist/**/*.png', './dist/**/*.jpg', './dist/**/*.gif', './dist/**/*.css', './dist/**/*.js'])
    .pipe(publisher.publish(assetHeaders));

  var uncached = gulp.src(['./dist/**/*', '!./dist/**/*.png', '!./dist/**/*.jpg', '!./dist/**/*.gif', '!./dist/**/*.css', '!./dist/**/*.js'])
    .pipe(publisher.publish(normalHeaders));

  merge(assets, uncached)
    .pipe(publisher.sync())
    .pipe(awspublish.reporter());
});

gulp.task('watch', function() {
  gulp.watch(['index.html', 'index.js', 'index.css', 'assets/**/*'], ['build']);
});
