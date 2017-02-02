#! /usr/bin/env node

    "use strict";
import SSH from './SSH'

new SSH('root', '188.166.85.6', 'C:/Users/Descartes/.ssh/id_rsa')
    .then( function(ssh) {
        console.log(ssh.isConnection)
        ssh.provision('forge.sh')
    }).catch(error => {
        console.log(error)
    })


