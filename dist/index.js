#! /usr/bin/env node


"use strict";
//import SSH from './SSH'

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _sshExec = require('./SSH/ssh-exec');

var _sshExec2 = _interopRequireDefault(_sshExec);

var _files = require('./lib/files');

var _files2 = _interopRequireDefault(_files);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = new _config2.default('config.json');

var exec = require('child_process').execFileSync;

var questions = [{
    type: 'confirm',
    name: 'digitalOceanConfirm',
    message: 'Do you use Digital Ocean?',
    default: false
}, {
    type: 'input',
    when: function when(answers) {
        return answers.digitalOceanConfirm;
    },
    name: 'DOKey',
    message: 'What is your Digital Ocean key?',
    validate: function validate(value) {
        var pass = value.length > 20;
        if (pass) {
            return true;
        }
        return 'Please enter a valid API key';
    }
}, {
    type: 'confirm',
    name: 'serverConfirm',
    message: 'Do you have a server? \n (Otherwise DEPLOYER will create a new server for you.)',
    default: false
}, {
    type: 'input',
    when: function when(answers) {
        return answers.serverConfirm;
    },
    name: 'serverIP',
    message: 'What is the IP of your server',
    validate: function validate(value) {
        var pass = value.match('^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$');
        if (pass) {
            return true;
        }
        return 'Please enter a valid IPv4 address';
    }
}, {
    type: 'input',
    when: function when(answers) {
        return answers.serverConfirm;
    },
    name: 'serverUser',
    message: 'What is your servers root user?'
}, {
    type: 'input',
    when: function when(answers) {
        return answers.serverConfirm;
    },
    name: 'serverKey',
    message: 'Where is your ssh key located? \n  (Note: DEPLOYER can only connect via ssh key)',
    default: '~/.ssh/id_pub'
}, {
    type: 'confirm',
    name: 'provisionConfirm',
    message: 'Do you want DEPLOYER to provision your server?',
    default: '~/.ssh/id_pub'
}, {
    type: 'confirm',
    when: function when(answers) {
        return answers.provisionConfirm;
    },
    name: 'provisionScript',
    message: 'Where is your provision file?',
    default: '~/.ssh/id_pub'
}];

var config_json = {
    project: {
        domain: "site.com",
        github_repo: "dopyoman/test",
        folder: "/var/site/",
        git_folder: "/home/user/site.git"
    },
    server: {
        confirm: true,
        host: "188.166.18.140",
        user: "forge",
        key: "C:/Users/Euler/.ssh/id_rsa"
    }
};

_commander2.default.command('init').description('generate template files for provisioning and configuring your server').action(function () {
    console.log('generating files ...');
    _inquirer2.default.prompt(questions).then(function (answers) {
        console.log('\nresponse:');
        console.log(JSON.stringify(answers, null, '  '));

        config_json.server.user = answers.serverUser;
        config_json.server.key = answers.serverKey;
        config_json.server.host = answers.serverIP;
        config_json.server.confirm = answers.serverConfirm;

        config.writeAll(config_json);

        exec('jigsaw-trimmer.bat', ['init']);
    });
});

_commander2.default.command('deploy').description('push app to server').action(function () {
    console.log('deploying site ...');

    var conf = config.read();

    var ssh = new _sshExec2.default(conf.server.user, conf.server.host, conf.server.key, config_json).then(function (ssh) {
        return ssh.checkCurrentDir();
    }).then(function (ssh) {
        ssh.createProject(conf.project.github_repo, conf.project.domain).then(function (ssh) {
            ssh.deploySite(conf.project.domain);
        });
    }).catch(function (e) {
        console.error(e);
    });
});

_commander2.default.command('build').alias('b').description('build static files from templates for inspection').action(function () {
    console.log('building files ...');
    exec('jigsaw-trimmer.bat', ['build']);
});

_commander2.default.command('provision').description('Provision a new server').action(function () {

    var conf = config.read();

    var ssh = new _sshExec2.default(conf.server.user, conf.server.host, conf.server.key, config_json).then(function (ssh) {
        return ssh.checkCurrentDir();
    }).then(function (ssh) {
        return ssh.provision('main.sh', '/tmp');
    }).catch(function (e) {
        console.error(e);
    });
});
_commander2.default.parse(process.argv);