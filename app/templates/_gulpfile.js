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

gulp.task('git-initial-commit', ['git-init'], function(done) {
	gulp.src(['./*', '!./node_modules/**/*.*', '!./index.html'])
		.pipe(cache('master'))
		.pipe(git.add())
		.pipe(git.commit('initial commit'))
		.on('error', gutil.log)
		.on('end', done);

	git.push('origin', 'master');
});

gulp.task('init', [
	'git-initial-commit'
]);



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
	return gulp.src(['./**/*', '!./gulpfile.js', '!./index.html'], {'nonegate': false})
		.pipe(git.rm({args: '-rf'}))
		.on('error', gutil.log);
});

gulp.task('git-create-dummy-index', ['git-remove-files'], function(done) {
	fs.writeFile('index.html', 'Docs coming soon.');
});

gulp.task('git-commit-gh-pages', ['git-create-dummy-index'], function(done) {
	gulp.src(['./**/*', '!./node_modules/**/*.*', '!./gulpfile.js'])
		.pipe(debug())
		.pipe(git.checkout('gh-pages'))
		.pipe(cache('gh-pages'))
		.pipe(git.add())
		.pipe(git.commit('initial gh-pages commit'))
		.on('error', gutil.log);

	git.push('origin', 'gh-pages');

	done();
});

gulp.task('gh-pages', [
	'git-commit-gh-pages'
]);



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


