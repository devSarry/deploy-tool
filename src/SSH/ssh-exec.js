"use strict";

import ErrorHandler from '../ErrorHandler'
import node_ssh from 'node-ssh';
import files from '../lib/files'
var exec = require('ssh-exec');


const ssh = new node_ssh();
const isProvisionedPath = files.getCurrentDirectoryBase() + '/.provisioned';


class SSH {

    constructor(user, host, key, config = null) {
        this._host = host;
        this._user = user;
        this._key = key;

        this._config = config;

        this._workingDirectory = '/home/' + user + '/';

        return new Promise((resolve) => {
            this.checkConnection().then(value => {
                console.log('connected')
                resolve(this);
            });
        });
    }

    checkConnection() {
        let _this = this;
        return new Promise((resolove, reject) => {
            ssh.connect({
                host: this._host,
                username: this._user,
                privateKey: this._key
            }).then(function () {
                // Local, Remote
                console.log('Connection established');

                _this.isConnection = true;

                _this.sshConfig = {
                    host: _this._host,
                    username: _this._user,
                    privateKey: _this._key
                };

                _this._isConnection = true;

                ssh.exec('pwd').then(function (result) {
                    ErrorHandler.instance.info('STDOUT: ' + result);
                    resolove(ssh)
                });
            })
                .catch(error => {
                    _this.isConnection = false;
                    ErrorHandler.instance.error(error);
                    console.log('Connection failed:', error);
                    reject(false);
                })
        })

    }

    checkCurrentDir() {
        let _this = this;
        return new Promise((resolve, err) => {
            ssh.exec('pwd').then(function (result) {
                ErrorHandler.instance.info('STDOUT SHOUDS: ' + result);
                console.log(result);
                resolve(_this);
            })
        })
    }

    provision(file, path) {
        let filePath = 'server/compiled/Provision/' + file;
        let cleanFile = 'clean_' + file;
        path = path ? path : this._workingDirectory;

        console.log('the path is ' , path, filePath)


        return new Promise((resolve, error) =>{
            ErrorHandler.instance.info('Provision file: ' + filePath);
            this.checkIfProvisioned()
                .then(provisioned => {
                    if(!provisioned) {
                        this.uploadScript(path, filePath, file)
                            .then((result) => {
                                console.log('upload script: ' + result)
                                this.runProvision(path, file)
                                    .then((result) => {
                                        resolve(this)
                                    })
                            })
                    }
                })
        })
    }

    runProvision(cwd, cleanFile) {
        return new Promise((resolve) => {
            console.log('run provision')
            exec('cd ' + cwd + '&& bash ' + cleanFile, {
                    user: this._user,
                    host: this._host,
                    key: this._key
                }, function (err, stdout, stderr) {
                    ErrorHandler.instance.info(stdout)
                    resolve(this)
                }
            ).pipe(process.stdout)
        })
    }


    uploadScript(cwd, filePath, file) {
        filePath = files.getCurrentWorkingDirectory() + filePath;
        let preCleanedFile = 'pre_cleaned_' + file;

        cwd = cwd ? cwd : this._workingDirectory;

        let preCleanedRemote = cwd + '/' + preCleanedFile;

        console.log(filePath, cwd,preCleanedRemote, file)


        return ssh.putFile(filePath, preCleanedRemote)
            .then(result => {
                console.log('script ' + file + ' uploaded!!');
                ErrorHandler.instance.info('script uploaded: ' + result);
                ssh.execCommand("sed 's/\\r//' " + preCleanedFile + "> " +  file, {cwd: cwd, stream: 'stdout'});
            }).catch(e => {
                ErrorHandler.instance.error(e)
            })
    }

    checkIfProvisioned() {
        let _this = this;
        return ssh.getFile('/home/' + _this.user + '/.provisioned', isProvisionedPath)
            .then(contents => {
                console.log('server has been previously pro')
                ErrorHandler.instance.info('Server has been previously provisioned' + contents);
                //files.removeFile(isProvisionedPath);
                return (true);
            })
            .catch(notProvisionedError => {
                ErrorHandler.instance.error('Server has not been provisioned ' + notProvisionedError);
                return false;
            })
    }

    createProject(gitRepo, domain) {
        return new Promise((resolve, error)=> {
            ssh.execCommand('git clone ' + gitRepo + ' ' + domain +
                ' && cd ' + domain +
                ' && composer install && npm install' , {cwd: '/home/' + this._user})
                resolve(this)
        })
    }

    deploySite(domain) {
        let cwd = '/home/' + this._user +'/' + domain;
        return new Promise((resolve, error) =>{
            this.uploadScript(cwd,
                'server/compiled/nginx_conf/serve-site.sh',
                domain
            ).then( res => {
                ssh.execCommand('sudo bash serve-site', {cwd: cwd, stream: 'stdout'})
            })
            resolve(this)
        })
    }
    projectExists() {
        return new Promise((resolve, error) => {
            ssh.execCommand('ls -r /var/project/site.git/.project', {stream: 'both'})
                .then( response => {
                    if( response.stdout === '/var/project/site.git/.project') {
                        ErrorHandler.instance.info('Project exists:', response.stdout);
                        resolve(true)
                    }else {
                        ErrorHandler.instance.error('Project not created:', response.stderr);
                        resolve(false)
                    }
                } )
        })
    }

    createProjectDir(domain) {
        let projectPath  = '/var/project/' + domain + '.git';
        
        return ssh.execCommand('mkdir -p ' + projectPath)
                .then(result =>{
                ErrorHandler.instance.info('create project dir', result.stdout)
            })
            .then(() => {
                return ssh.execCommand('git init ' + projectPath + ' --bare')
            })
            .then(() => {
                return this.uploadScript('gitPost.sh', projectPath + '/hooks/post-receive' )
            })
            .then(()=>{
                ssh.execCommand('chmod +x ' + projectPath + '/hooks/post-receive')
            })
            .then(()=> {
                ssh.execCommand('touch ' + projectPath + '.project')
            })
    }
}

export default SSH