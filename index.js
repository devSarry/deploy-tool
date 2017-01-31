#! /usr/bin/env node
"use strict";
let chalk       = require('chalk');
var clear       = require('clear');
var CLI         = require('clui');
var figlet      = require('figlet');
var inquirer    = require('inquirer');
var Preferences = require('preferences');
var Spinner     = CLI.Spinner;
var GitHubApi   = require('github');
var _           = require('lodash');
var git         = require('simple-git')();
var touch       = require('touch');
var fs          = require('fs');

var node_ssh = require('node-ssh')
var ssh = new node_ssh()

console.log(
  chalk.yellow(
    figlet.textSync('Deployer', { horizontalLayout: 'full' })
  ) + '\n' +
  chalk.green(
    'Here will be some kind of description of the project' 
)
);

var github = new GitHubApi({
  version: '3.0.0'
});

function getGithubCredentials(callback) {
  var questions = [
    {
      name: 'host',
      type: 'input',
      message: 'Enter the IP or host of our server',
      validate: function( value ) {
        if (value.length) {
          return true;
        } else {
          return 'Enter the IP or host of our server';
        }
      }
    },
    {
      name: 'user',
      type: 'input',
      message: 'Enter the user',
      validate: function( value ) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter a user';
        }
      }
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
      validate: function(value) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter your password';
        }
      }
    }
  ];

  inquirer.prompt(questions).then(callback);
}




// ssh.connect({
//   host: '198.211.124.95',
//   username: 'makkaraperuna',
//   privateKey: '/home/jonathan/.ssh/id_rsa'
// }).then(function() {
//   // Local, Remote 
// 	ssh.exec('pwd').then(function(result) {
//     console.log('STDOUT: ' + result)
//     ssh.dispose();
//   })
// })
function getGithubToken(callback) {
  var prefs = new Preferences('ginit');

  if (prefs.github && prefs.github.token) {
    return callback(null, prefs.github.token);
  }

  getGithubCredentials(function(credentials) {
    var status = new Spinner('Authenticating you, please wait...');
    status.start();

    github.authenticate(
      _.extend(
        {
          type: 'basic',
        },
        credentials
      )
    );

    github.authorization.create({
      scopes: ['user', 'public_repo', 'repo', 'repo:status'],
      note: 'ginit, the command-line tool for initalizing Git repos'
    }, function(err, res) {
      status.stop();
      if ( err ) {
        return callback( err );
      }
      if (res.token) {
        prefs.github = {
          token : res.token
        };
        return callback(null, res.token);
      }
      return callback();
    });
  });
}


getGithubToken(() => {
	console.log(args)
})