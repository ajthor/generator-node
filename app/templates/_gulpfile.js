var exec = require('child_process').exec;

var gulp = require('gulp');
var gutil = require('gulp-util');

var git = require('gulp-git');
var github = require('github');

var docco = require('gulp-docco');

var cache = require('gulp-cached');
var remember = require('gulp-remember');



gulp.task('git-init', function() {
	git.init();
});

gulp.task('git-initial-commit', ['git-init'], function(done) {
	gulp.src(['.', '!node_modules/'])
		.pipe(cache('master'))
		.pipe(git.add())
		.pipe(git.commit('initial commit'))
		.on('error', gutil.log)
		.on('end', done);

	git.push('origin', 'master');
});

gulp.task('init', [
	'git-init', 
	'git-initial-commit'
]);



gulp.task('git-create-gh-pages', ['init'], function(done) {
	gulp.src('.')
		.pipe(git.checkout('--orphan gh-pages'));
	// (function() {
	// 	exec('git checkout --orphan gh-pages', {cwd: process.cwd()},
	// 		function (error, stdout, stderr) {
	// 			console.log('stdout: ' + stdout);
	// 			console.log('stderr: ' + stderr);
	// 			if (error !== null) {
	// 				console.log('exec error: ' + error);
	// 			}
	// 		});
	// 	exec('git rm -rf .', {cwd: process.cwd()},
	// 		function (error, stdout, stderr) {
	// 			console.log('stdout: ' + stdout);
	// 			console.log('stderr: ' + stderr);
	// 			if (error !== null) {
	// 				console.log('exec error: ' + error);
	// 			}
	// 		});
	// 	exec('echo \"Docs coming soon.\" > index.html', {cwd: process.cwd()},
	// 		function (error, stdout, stderr) {
	// 			console.log('stdout: ' + stdout);
	// 			console.log('stderr: ' + stderr);
	// 			if (error !== null) {
	// 				console.log('exec error: ' + error);
	// 			}
	// 		});
	// })();

	done();
});

gulp.task('git-commit-gh-pages', function(done) {
	gulp.src(['.', '!node_modules/'])
		.pipe(cache('gh-pages'))
		.pipe(git.add())
		.pipe(git.commit('initial gh-pages commit'))
		.on('end', done);

	git.push('origin', 'gh-pages');
});

gulp.task('gh-pages', [
	'init', 
	'git-create-gh-pages',
	'git-commit-gh-pages'
]);



gulp.task('git-add-remote', ['git-init'], function(done) {
	git.addRemote('origin', '<%= repoUrl %>', {}, function() {});
	git.push('origin', 'master');

	done();
});

gulp.task('git-create-development-branch', ['git-init'], function(done) {
	git.branch('development', {}, function() {});
	gulp.src('.')
		.pipe(git.checkout('development'))
		.on('end', done);
});

gulp.task('setup', ['init', 'gh-pages', 'git-add-remote', 'git-create-development-branch']);

// gulp.task('docs', function() {

// 	var timeStamp = Date.now().toDateString();

// 	gulp.src('./lib/**/*.js')
// 		.pipe(docco())
// 		.pipe(cache('docs'));

// 	gulp.src('./*')
// 		.pipe(git.checkout('gh-pages'))
// 		.pipe(remember('docs'))
// 		.pipe(gulp.dest('./'))
// 		.pipe(git.commit('update docs' + timeStamp, {args: '-a -m'}))
// 		.pipe(git.push('origin', 'gh-pages'))
// 		.pipe(git.checkout('master'));

// });