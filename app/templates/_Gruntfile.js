var grunt = require('grunt');

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),

	shell: {
		options: {
			stdout: true,
			stderr: true
		},

		'git-reset': {
			command: 'rm -rf .git'
		},

// Init Task
// =========
// The `init` task does what it says, it initializes the local git 
// repository by making an initial commit. Then, it runs the 
// gh-pages and dev tasks.
// 
// Usage: `grunt init`
// 
		'git-init': {
			command: [
				'git init',
				'git add .',
				'git commit -a -m \"initial commit\"',
				'git remote add origin <%= repoUrl %>'
			].join('&&')
		},

// Gh-Pages Task
// =============
// The `gh-pages` task creates an orphaned branch and removes all 
// files except for index.html, which it commits to the branch as the 
// only file. This file is intended to be used as the repo's info 
// page on GitHub.
// 
// Usage: `grunt gh-pages`
// 
		'gh-pages': {
			command: [
				'git checkout --orphan gh-pages',
				'git rm -rf .',
				'echo \"Docs coming soon.\" > index.html',
				'git add index.html',
				'git commit -a -m \"initial gh-pages commit\"'
			].join('&&')
		},

// Dev Task
// ========
// The `dev` task basically creates a 'development' branch off of 
// master and switches to it. Make sure to call this after calling 
// `grunt git-init`.
// 
// Usage: `grunt dev`
// 
		'git-dev': {
			command: [
				'git checkout master',
				'git branch development',
				'git checkout development'
			].join('&&')
		}
	}
});

grunt.task.loadNpmTasks('grunt-shell');



grunt.registerTask('gh-pages', ['shell:gh-pages']);
grunt.registerTask('dev', ['shell:git-dev']);

grunt.registerTask('init', [
	'shell:git-init', 
	'gh-pages', 
	'dev'
]);

grunt.registerTask('reset', ['shell:git-reset']);