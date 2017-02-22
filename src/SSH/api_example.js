#! /usr/bin/env node

"use strict";
//import SSH from './SSH'
import SSH2 from './SSH/ssh-exec'
/*  User Story  */
/*A creates a new instance of SSH and provides 1. Username, 2. IP, 3, location of ssh key
* => check if valid by trying to ssh into server and creating connection
*
* The user then tries to provision by providing the provision script
* => check if server has been provisioned if not
*   => upload script
*   => remove and return carage breaks
*   => run script
*   => pipe progress back to console
*
* The user tries to create a new project by providing the domain name
 * => create a bare git repo 'site.git' in /var/project
 * => upload post-recive script and make executable
 * => add newly created git remote to local git repo
 * => locally exec git push to server
 * */


new SSH2('root', '188.166.85.6', 'C:/Users/Descartes/.ssh/id_rsa')
    .then( (ssh) => {
        return ssh.provision('test.sh')
    })
    .then (ssh => {
        return ssh.checkCurrentDir();
    })
    .then(ssh => {
        ssh.createProject('site.com');
    })









