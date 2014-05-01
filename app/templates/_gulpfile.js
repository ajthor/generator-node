var exec = require('child_process').exec;

var gulp = require('gulp');
var gutil = require('gulp-util');
var git = require('gulp-git');
var docco = require('gulp-docco');

var cache = require('gulp-cached');
var remember = require('gulp-remember');

// Init Task
// =========
// The `init` task does what it says, it initializes the local git 
// repository by committing the contents of the `lib` directory as 
// well as some of the common files that are in the root directory.
// 
// Usage: `gulp init`
// 
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
		.pipe(git.add())
		.pipe(git.commit('initial commit'))
		.on('error', gutil.log);
});

gulp.task('git-add-remote', ['git-initial-commit'], function(done) {
	git.addRemote('origin', '<%= repoUrl %>', {}, function() {});
	git.push('origin', 'master');

	done();
});

gulp.task('init', ['git-add-remote'], function() {
	git.push('origin', 'master');
});

gulp.task('git-checkout-master', function() {
	return gulp.src('.')
		.pipe(git.checkout('master'));
});

// Gh-Pages Task
// =============
// The `gh-pages` task creates an orphaned branch and removes all 
// files except for index.html, which it commits to the branch as the 
// only file. This file is intended to be used as the repo's 
// page on GitHub. __NOTE:__ Very buggy currently.
// 
// Usage: `gulp gh-pages`
// 
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
		'.travis.yml',
		'lib/**/*',
		'package.json'
	], {dot: true})
		.pipe(git.rm({args: '-rf'}))
		.on('error', gutil.log);
});

gulp.task('git-commit-gh-pages', ['git-remove-files'], function() {
	return gulp.src(['index.html'])
		.pipe(git.add())
		.pipe(git.commit('initial gh-pages commit'))
		.on('error', gutil.log);
});

gulp.task('gh-pages', ['git-commit-gh-pages'], function() {
	git.push('origin', 'gh-pages');
});

gulp.task('git-checkout-gh-pages', function() {
	return gulp.src('.')
		.pipe(git.checkout('gh-pages'))
		.on('error', gutil.log);
});

// Dev Task
// ========
// The `dev` task basically creates a 'development' branch off of 
// master and switches to it. Make sure to call this after calling 
// `gulp init`.
// 
// Usage: `gulp dev`
// 
gulp.task('git-create-development-branch', ['git-checkout-master'], function() {
	git.branch('development', {}, function() {});
	
	return gulp.src('.')
		.pipe(git.checkout('development'))
		.on('error', gutil.log);
});

gulp.task('dev', ['git-create-development-branch']);

gulp.task('git-checkout-development', function() {
	return gulp.src('.')
		.pipe(git.checkout('development'))
		.on('error', gutil.log);
});

// Docs Task
// =========
// The `docs` task builds docco files, switches to the gh-pages 
// branch, commits the docs, and switches back to the master branch.
// 
// Usage: `gulp docs`
// 
gulp.task('docs-make', ['git-checkout-master'], function() {
	return gulp.src('lib/**/*.js')
		.pipe(docco())
		.pipe(gulp.dest('./docs/'))
		.on('error', gutil.log);
});

gulp.task('docs-checkout-gh-pages', ['docs-make'], function() {
	return gulp.src('.')
		.pipe(git.checkout('gh-pages'))
		.on('error', gutil.log);
});

gulp.task('docs-commit', ['docs-checkout-gh-pages'], function() {
	var timeStamp = Date.now();
	console.log(timeStamp);

	return gulp.src('docs/')
		.pipe(git.add())
		.pipe(git.commit("update docs"))
		.on('error', gutil.log);
});

gulp.task('docs-checkout-master', ['docs-commit'], function() {
	return gulp.src('.')
		.pipe(git.checkout('master'))
		.on('error', gutil.log);
});

gulp.task('docs', ['docs-checkout-master'], function() {
	git.push('origin', 'gh-pages');
});


