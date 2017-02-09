#! /usr/bin/env node

    "use strict";
//import SSH from './SSH'
import SSH2 from './SSH/ssh-exec'

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









