var fs = require('fs');
var exec = require('child_process').exec;

var gulp = require('gulp');
var gutil = require('gulp-util');
var debug = require('gulp-debug');

var git = require('gulp-git');
var github = require('github');

var docco = require('gulp-docco');

var cache = require('gulp-cached');
var remember = require('gulp-remember');



gulp.task('git-init', function(done) {
	git.init();
	done();
});

gulp.task('git-initial-commit', ['git-init'], function() {
	return gulp.src([
		'.editorconfig',
		'.jshintrc',
		'.travis.yml',
		'lib/**/*',
		'gulpfile.js',
		'package.json',
	], {dot: true})
		.pipe(cache('master'))
		.pipe(git.add())
		.pipe(git.commit('initial commit'))
		.on('error', gutil.log);
});

gulp.task('init', ['git-initial-commit'], function() {
	git.push('origin', 'master');
});



gulp.task('git-create-gh-pages', ['git-init'], function(done) {
	exec('git checkout --orphan gh-pages', {cwd: process.cwd()},
		function (error) {
			if (error !== null) {
				console.log('exec error: ' + error);
			}
		});

	done();
});

gulp.task('git-remove-files', ['git-create-gh-pages'], function() {
	return gulp.src([
		'.editorconfig',
		'.jshintrc',
		'lib/**/*',
		'package.json'
	], {dot: true})
		.pipe(git.rm({args: '-rf'}))
		.on('error', gutil.log);
});

gulp.task('git-commit-gh-pages', ['git-remove-files'], function() {
	return gulp.src(['index.html'])
		.pipe(cache('gh-pages'))
		.pipe(git.add())
		.pipe(git.commit('initial gh-pages commit'))
		.on('error', gutil.log);
});

gulp.task('gh-pages', ['git-commit-gh-pages'], function() {
	git.push('origin', 'gh-pages');
});



gulp.task('git-add-remote', ['git-init'], function(done) {
	git.addRemote('origin', '<%= repoUrl %>', {}, function() {});
	git.push('origin', 'master');

	done();
});

gulp.task('git-create-development-branch', ['git-init'], function(done) {
	git.branch('development', {}, function() {});
	gulp.src('./**/*')
		.pipe(git.checkout('development'))
		.on('error', gutil.log)
		.on('end', done);
});

gulp.task('setup', [
	'init',
	'gh-pages', 
	'git-add-remote', 
	'git-create-development-branch'
]);



gulp.task('docs', function() {

	var timeStamp = Date.now().toDateString();

	gulp.src('./lib/**/*.js')
		.pipe(docco())
		.pipe(cache('docs'));

	gulp.src('./**/*')
		.pipe(git.checkout('gh-pages'))
		.pipe(remember('docs'))
		.pipe(gulp.dest('./'))
		.pipe(git.commit('update docs' + timeStamp))
		.on('error', gutil.log);

	git.push('origin', 'gh-pages');
	
	gulp.src('./**/*')
		.pipe(git.checkout('master'))
		.on('error', gutil.log);

	done();

});


