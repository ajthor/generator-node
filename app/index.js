'use strict';
var fs = require('fs');
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var npmName = require('npm-name');


var NodeGenerator = yeoman.generators.Base.extend({
	init: function() {
		// var done = this.async();
		this.pkg = require('../package.json');

		this.option('git', {
			desc: 'Initialize the project with git.',
			type: Boolean,
			required: false
		});

		if((typeof this.options.git === 'undefined') || (this.options.git === null)) {
			this.options.git = true;
		}

		this.on('end', function() {
			if (!this.options['skip-install']) {
				this.installDependencies({
					bower: false,
					callback: function() {
						this.log(chalk.red('\n\nINITIALIZING GIT'));
						this.log('Please wait...\n\n');

						if(this.options.git) {
							this.spawnCommand('grunt', ['init']);
						}
					}.bind(this)
				});
			}

			// done();
		});
	},

	welcome: function() {
		// have Yeoman greet the user
		this.log(this.yeoman);

		this.log(chalk.red('---- NODE.JS PROJECT GENERATOR ----'));
		this.log('Use this generator to scaffold basic node.js projects.\n\n');
	},

	askFor: function() {
		var done = this.async();

		var prompts = [{
			name: 'githubUser',
			message: 'What is your GitHub user name?'
		}, {
			name: 'name',
			message: 'What is the name of your project?',
			default: path.basename(process.cwd()),
			filter: function(input) {
				var done = this.async();

				npmName(input, function(err, available) {
					if(!available) {
						this.log(chalk.yellow(name) + 'already exists on NPM.');
					}

					done(input);
				});
			}
		}, {
			name: 'description',
			message: 'Description'
		}];

		this.prompt(prompts, function(props) {
			this.githubUser = props.githubUser;

			this.name = this._.slugify(props.name);
			this.description = props.description;
			
			this.repoUrl = 'https://github.com/' + props.githubUser + '/' + this.name + '.git';
			this.repoLink = 'git@github.com:' + props.githubUser + '/' + this.name + '.git';

			done();
		}.bind(this));

		// this.githubUser = 'ajthor';
		// this.name = 'git-test';
		// this.description = '';
		// this.repoUrl = 'https://github.com/' + this.githubUser + '/' + this.name + '.git';
		// this.repoLink = 'git@github.com:' + this.githubUser + '/' + this.name + '.git';
	},

	directories: function() {
		this.mkdir('lib');
	},

	projectFiles: function() {
		this.template('_package.json', 'package.json');
		this.template('_gulpfile.js', 'gulpfile.js');
		this.template('_Gruntfile.js', 'Gruntfile.js');

		this.template('app.js', 'lib/' + this.name + '.js');
	},

	rootFiles: function() {
		var ignores = [
			'.DS_Store'
		];

		this.expandFiles('*', {
			cwd: path.join(this.src._base, '/root'),
			dot: true
		}).forEach(function(file) {
			if( ignores.indexOf(file) === -1 ) {
				this.copy(path.join(this.src._base, '/root', file), file);
			}
		}.bind(this));
	}
});

module.exports = NodeGenerator;