/* jshint ignore:start */
var gulp = require('gulp');
var vulcanize = require('gulp-vulcanize');
var crisper = require('gulp-crisper');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
//var minifyHTML = require('gulp-minify-html')
//var minifyInline = require('gulp-minify-inline');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var stripDebug = require('gulp-strip-debug');
var del = require('del');
var babel = require('gulp-babel');

var vulcanizedTmp = '.tmp/vulcanized';
var distDir = './dist';
var appDir = './app';

gulp.task('default', ['clean'], function (cb) {
	runSequence(
		'vulcanize',
		'babel', ['js', 'html', 'copy', 'copy-res'],
		cb);
});

// Clean output directory
gulp.task('clean', function () {
	return del(['.tmp', distDir]);
});

gulp.task('vulcanize', function () {
	return gulp.src(appDir + '/index.html')

	.pipe(vulcanize({
			strip: true,
			inlineScripts: true,
			inlineCss: true,
			// stripExcludes: false,
			stripComments: true
		}))
		.pipe(crisper({
			scriptInHead: false, // true is default
			onlySplit: false
		}))
		.pipe(gulp.dest(vulcanizedTmp));
});

gulp.task('babel', function () {
	return gulp.src(vulcanizedTmp + '/index.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(rename('index.es6.js'))
		.pipe(gulp.dest(vulcanizedTmp));
});

gulp.task('js', function () {
	return gulp.src([appDir + '/bower_components/babel-polyfill/browser-polyfill.js', vulcanizedTmp + '/index.es6.js'])
		.pipe(concat('index.js'))
		// Removes debug info : console.log...
		.pipe(stripDebug())
		.pipe(uglify({
			mangle: true
		}))
		.pipe(gulp.dest(distDir));
});

gulp.task('html', function () {
	return gulp.src([vulcanizedTmp + '/index.html'])
		.pipe(gulp.dest(distDir));
});

gulp.task('copy', function () {
	return gulp.src([
      '*',
      '!*.html',
      '!*.js',
      '!bower_components',
		'!elements',
      '!node_modules',
      '!scripts',
      '!styles',
		'!test'
	], {
		dot: true
	}).pipe(gulp.dest(distDir));
});

gulp.task('copy-libs', function () {
   return gulp.src([
		'bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill}/**/*'
	]).pipe(gulp.dest(distDir + '/bower_components'));
});

gulp.task('copy-res', function () {
	return gulp.src([appDir + '/res/**/*'])
		.pipe(gulp.dest(distDir+ '/res'));
});
