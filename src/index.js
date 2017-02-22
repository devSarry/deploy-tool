#! /usr/bin/env node

    "use strict";
//import SSH from './SSH'
import program from 'commander'
import inquirer from 'inquirer';

var questions = [
    {
        type: 'confirm',
        name: 'toBeDO',
        message: 'Do you use Digital Ocean?',
        default: false
    },
    {
        type: 'input',
        name: 'DOKey',
        message: 'What is your Digital Ocean key?',
        validate: function (value) {
            var pass = value.length > 20;
            if (pass){
                return true;
            }

            return 'Please enter a valid API key'
        }


    }
]

program.command( 'init')
    .description('generate template files for provisioning and configuring your server')
    .action(function () {
        console.log('generating files ...')
        inquirer.prompt(questions).then( answers => {
            console.log('\nresponse:');
            console.log(JSON.stringify(answers,null, '  '))
        })
    });

program.command('deploy')
    .description('push app to server')
    .action(function () {
        console.log('deploying site ...')
    });

program.command('build')
    .alias('b')
    .description('build static files from templates for inspection')
    .action(function () {
        console.log('building files ...')
    });



program.parse(process.argv);








