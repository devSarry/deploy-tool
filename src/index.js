#! /usr/bin/env node

    "use strict";
//import SSH from './SSH'
import program from 'commander'
import inquirer from 'inquirer';
import configLib from './config';
import SSH from './SSH/ssh-exec'
import files from './lib/files'


var config = new configLib('config.json')

var exec = require('child_process').execFileSync;

var questions = [
    {
        type: 'confirm',
        name: 'digitalOceanConfirm',
        message: 'Do you use Digital Ocean?',
        default: false
    },
    {
        type: 'input',
        when: (answers) => {return answers.digitalOceanConfirm},
        name: 'DOKey',
        message: 'What is your Digital Ocean key?',
        validate: function (value) {
            var pass = value.length > 20;
            if (pass){
                return true;
            }
            return 'Please enter a valid API key'
        }
    },
    {
        type: 'confirm',
        name: 'serverConfirm',
        message: 'Do you have a server? \n (Otherwise DEPLOYER will create a new server for you.)',
        default: false
    },
    {
        type: 'input',
        when: (answers) => {return answers.serverConfirm},
        name: 'serverIP',
        message: 'What is the IP of your server',
        validate: function (value) {
            var pass = value.match('^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$');
            if (pass){
                return true;
            }
            return 'Please enter a valid IPv4 address'
        }
    },
    {
        type: 'input',
        when: (answers) => {return answers.serverConfirm},
        name: 'serverUser',
        message: 'What is your servers root user?'
    },
    {
        type: 'input',
        when: (answers) => {return answers.serverConfirm},
        name: 'serverKey',
        message: 'Where is your ssh key located? \n  (Note: DEPLOYER can only connect via ssh key)',
        default: '~/.ssh/id_pub'
    },
    {
        type: 'confirm',
        name: 'provisionConfirm',
        message: 'Do you want DEPLOYER to provision your server?',
        default: '~/.ssh/id_pub'
    },
    {
        type: 'confirm',
        when: (answers) => {return answers.provisionConfirm},
        name: 'provisionScript',
        message: 'Where is your provision file?',
        default: '~/.ssh/id_pub'
    }


];



var config_json = {
  project: {
      domain: "site.com",
      github_repo: "dopyoman/test",
      folder: "/var/site/",
      git_folder: "/home/user/site.git"
  }  ,
    server: {
        confirm: true,
        host: "188.166.18.140",
        user: "forge",
        key: "C:/Users/Euler/.ssh/id_rsa"
    }
};

program.command( 'init')
    .description('generate template files for provisioning and configuring your server')
    .action(function () {
        console.log('generating files ...');
        inquirer.prompt(questions).then( answers => {
            console.log('\nresponse:');
            console.log(JSON.stringify(answers,null, '  '));

            config_json.server.user = answers.serverUser;
            config_json.server.key = answers.serverKey;
            config_json.server.host = answers.serverIP;
            config_json.server.confirm = answers.serverConfirm;

            config.writeAll(config_json);

            exec('jigsaw-trimmer.bat', ['init']);
        })
    });

program.command('deploy')
    .description('push app to server')
    .action(function () {
        console.log('deploying site ...')

        let conf = config.read();

        let ssh = new SSH(conf.server.user, conf.server.host, conf.server.key, config_json)

            .then (ssh => {
                return ssh.checkCurrentDir();
            })
            .then( (ssh) => {
                 ssh.createProject(conf.project.github_repo, conf.project.domain)
                     .then(ssh => {
                         ssh.deploySite(conf.project.domain)
                     })
            })

            .catch(e => {
                console.error(e);
            })

    });

program.command('build')
    .alias('b')
    .description('build static files from templates for inspection')
    .action(function () {
        console.log('building files ...');
        exec('jigsaw-trimmer.bat', ['build']);
    });

program.command('provision')
    .description('Provision a new server')
    .action( () => {

        let conf = config.read();

        let ssh = new SSH(conf.server.user, conf.server.host, conf.server.key, config_json)

            .then (ssh => {
                return ssh.checkCurrentDir();
            })
            .then( (ssh) => {
                return ssh.provision('main.sh', '/tmp')
            })

            .catch(e => {
                console.error(e);
            })
    });
program.parse(process.argv);








