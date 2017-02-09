"use strict"
import ErrorHandler from '../ErrorHandler'
import node_ssh from 'node-ssh';
import files from '../lib/files'
var exec = require('ssh-exec');


const ssh = new node_ssh();
const isProvisionedPath = files.getCurrentDirectoryBase() + '/.provisioned';


class SSH {
    constructor(user, host, key) {
        this._host = host;
        this._user = user;
        this._key = key;
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

    provision(filePath) {
        return new Promise((resolve, error) =>{
            this.checkIfProvisioned()
                .then(provisioned => {
                    if(!provisioned) {
                        this.uploadScript(filePath, '/var/deployer/preCleaned')
                            .then((result) => {
                                this.runProvision()
                                    .then((result) => {
                                        resolve(this)
                                    })
                            })
                    }
                })
        })
    }

    runProvision() {
        return new Promise((resolve, error) => {
            console.log('run provision')
            exec('cd /var/deployer && bash provision.sh', {
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


    uploadScript(filePath, remotePath) {
        return ssh.putFile(filePath, remotePath)
            .then(result => {
                console.log('script uploaded');
                ssh.execCommand("sed 's/\\r//' preCleaned > provision.sh", {cwd: '/var/deployer', stream: 'stdout'})
                    .then(result => {
                        ErrorHandler.instance.info('upload script', result);
                    })
            });
    }

    checkIfProvisioned() {
        let _this = this;
        return ssh.getFile('/home/' + _this.user + '/.provisioned', isProvisionedPath)
            .then(contents => {
                console.log('server has been previously pro')
                ErrorHandler.instance.info('Server has been previously provisioned' + contents);
                files.removeFile(isProvisionedPath);
                return (true);
            })
            .catch(notProvisionedError => {
                ErrorHandler.instance.error('Server has not been provisioned ' + notProvisionedError);
                return false;
            })
    }

    createProject(domain) {
        let bareDomain = domain.substr(0,a.length -4);

        return new Promise((resolve, error)=> {
            this.projectExists()
                .then(response => {
                    if(response){
                        this.createProjectDir(bareDomain)
                    }
                })
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