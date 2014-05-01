var fs = require('fs');
var exec = require('child_process').exec;

var gulp = require('gulp');
var gutil = require('gulp-util');

var git = require('gulp-git');
var github = require('github');

var docco = require('gulp-docco');

var cache = require('gulp-cached');
var remember = require('gulp-remember');


gulp.task('init', ['setup']);



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

gulp.task('git-add-remote', ['git-initial-commit'], function(done) {
	git.addRemote('origin', '<%= repoUrl %>', {}, function() {});
	git.push('origin', 'master');

	done();
});

gulp.task('setup', ['git-add-remote'], function() {
	git.push('origin', 'master');
});

gulp.task('git-checkout-master', function() {
	return gulp.src('.')
		.pipe(git.checkout('master'));
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
		'.travis.yml',
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



gulp.task('git-create-development-branch', ['git-checkout-master'], function() {
	git.branch('development', {}, function() {});
	
	return gulp.src('.')
		.pipe(git.checkout('development'))
		.on('error', gutil.log);
});

gulp.task('dev', ['git-create-development-branch']);



gulp.task('docs', ['git-checkout-master'], function(done) {

	var timeStamp = Date.now().toDateString();

	gulp.src('lib/**/*.js')
		.pipe(docco())
		.pipe(cache('docs'));

	gulp.src('.')
		.pipe(git.checkout('gh-pages'))
		.pipe(remember('docs'))
		.pipe(gulp.dest('./'))
		.pipe(git.commit('update docs' + timeStamp))
		.on('error', gutil.log);

	git.push('origin', 'gh-pages');
	
	gulp.src('.')
		.pipe(git.checkout('master'))
		.on('error', gutil.log);

	done();

});


