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

		'git-init': {
			command: [
				'git init',
				'git add .',
				'git commit -a -m \"initial commit\"',
				'git remote add origin <%= repoLink %>',
				'git push origin master'
			].join('&&')
		},

		'gh-pages': {
			command: [
				'git checkout --orphan gh-pages',
				'git rm -rf .',
				'echo \"Docs coming soon.\" > index.html',
				'git add index.html',
				'git commit -a -m \"initial gh-pages commit\"',
				'git push origin gh-pages' 
			].join('&&')
		},

		'git-dev': {
			command: [
				'git checkout master',
				'git branch development',
				'git checkout development'
			].join('&&')
		}
	}
});


grunt.task.loadNpmTasks('grunt-git');
grunt.task.loadNpmTasks('grunt-shell');


grunt.registerTask('init', function() {
	grunt.task.run(['shell:git-init']);
	grunt.task.run(['shell:gh-pages']);
	grunt.task.run(['shell:git-dev']);
});

grunt.registerTask('reset', ['shell:git-reset']);