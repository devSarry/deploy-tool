"use strict";

import ErrorHandler from '../ErrorHandler'
import node_ssh from 'node-ssh';
import files from '../lib/files'

const ssh = new node_ssh();

const _Log = ErrorHandler.instance;

const isProvisionedPath = files.getCurrentDirectoryBase() + '/.provisioned';

class SSH {
    constructor(user, host, key) {
        this._host = host;
        this._user = user;
        this.key = key;

        return new Promise((resolve) => {
            this.checkConnection().then(value => {
                this.ssh = value;
                resolve(this);
            });
        });

    }


    provision(filePath) {
        this.checkIfProvisioned().then((provisioned) => {
            console.log('server has been provisoned')
        }).catch(notProvisioned => {
            ssh.putFile(filePath, '/var/deployer/preCleaned')
                .then(result => {
                    ssh.execCommand("sed 's/^M$//' preCleaned > provision.sh", {cwd: '/var/deployer', stream: 'stdout'})
                        .then(result => {
                            ErrorHandler.instance.info(result);
                        })
                        .catch(error => {
                            ErrorHandler.instance.error('Something went wrong with provisioning \n' + error)
                        })
                })
                .catch(error => {
                    ErrorHandler.instance.error('Provision file could not be written to server ' + error)
                })
            ssh.execCommand('bash provision.sh', {cwd: '/var/deployer', stream: 'stdout'})
                .then( result => {
                    ErrorHandler.instance.info(result)
                })
                .catch( error => {

                })
        })

        /**/

    }


    /* see a way to auto add key to known hosts*/
    checkConnection() {
        let _this = this;
        return new Promise((resolove, reject) => {
            ssh.connect({
                host: this.host,
                username: this.user,
                privateKey: this.key
            }).then(function () {
                // Local, Remote
                _this.isConnection = true;

                _this.sshConfig = {
                    host: _this.host,
                    username: _this.user,
                    privateKey: _this.key
                };

                _this._isConnection = true;

                ssh.exec('pwd').then(function (result) {
                    ErrorHandler.instance.info('STDOUT: ' + result);
                    resolove(ssh)
                });
            })
                .catch(error => {
                    _this.isConnection = false;
                    ErrorHandler.instance.error(error)
                    reject(false)
                    ssh.dispose();
                })
        })

    }

    checkIfProvisioned() {
        let _this = this;
        return new Promise((resolove, reject) => {
            console.log('where going')
            ssh.getFile('/home/' + _this.user + '/.provisioned', isProvisionedPath)
                .then(contents => {
                    ErrorHandler.instance.info('Server has been previously provisioned' + contents);
                    files.removeFile(isProvisionedPath);
                    resolve(true);
                })
                .catch(notProvisionedError => {
                    ErrorHandler.instance.error('Server has not been provisioned ' + notProvisionedError);
                    reject(false);
                })
        })

    }

    get isConnection() {
        return this._isConnection;
    }

    set isConnection(value) {
        this._isConnection = value
    }

    set sshConfig(value) {
        this._sshConfig = value;
    }

    get sshConfig() {
        return this._sshConfig
    }

    get key() {
        return this._key;
    }

    set key(value) {
        try {
            if (!files.fileExists(value)) throw 'key file does not exist'
        }
        catch (error) {
            _Log.log(error)
        }
        this._key = value;
    }

    get user() {
        return this._user;
    }

    set user(value) {
        try {
            if (value.length < 1) throw 'Please enter a user';
            this._user = value;
        }
        catch (error) {
            _Log.log(error)
        }
    }

    get host() {
        return this._host;
    }

    set host(value) {
        try {
            var re = new RegExp("^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$.");
            if (!re.test(value)) throw 'Host must be an ip';
            this._host = value;
        }
        catch (error) {
            _Log.log(error)
        }
    }

}

export default SSH