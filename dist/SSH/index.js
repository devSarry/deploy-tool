"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ErrorHandler = require('../ErrorHandler');

var _ErrorHandler2 = _interopRequireDefault(_ErrorHandler);

var _nodeSsh = require('node-ssh');

var _nodeSsh2 = _interopRequireDefault(_nodeSsh);

var _files = require('../lib/files');

var _files2 = _interopRequireDefault(_files);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ssh = new _nodeSsh2.default();

var _Log = _ErrorHandler2.default.instance;

var isProvisionedPath = _files2.default.getCurrentDirectoryBase() + '/.provisioned';

var SSH = function () {
    function SSH(user, host, key) {
        var _this2 = this;

        _classCallCheck(this, SSH);

        this._host = host;
        this._user = user;
        this.key = key;

        return new Promise(function (resolve) {
            _this2.checkConnection().then(function (value) {
                _this2.ssh = value;
                resolve(_this2);
            });
        });
    }

    _createClass(SSH, [{
        key: 'provision',
        value: function provision(filePath) {
            ssh.exec('pwd').then(function (result) {
                _ErrorHandler2.default.instance.info('STDOUT SHOUDS: ' + result);
                //resolove(ssh)
            });
            ssh.exec('pwd').then(function (result) {
                _ErrorHandler2.default.instance.info('STDOUT PENIS: ' + result);
                //resolove(ssh)
            });
            ssh.getFile('/home/' + this.user + '/.provisioned', isProvisionedPath).then(function (contents) {
                _ErrorHandler2.default.instance.info('Server has been previously provisioned' + contents);
                _files2.default.removeFile(isProvisionedPath);
                resolve(true);
            }).catch(function (notProvisionedError) {
                _ErrorHandler2.default.instance.error('Server has not been provisioned ' + notProvisionedError);
                reject(false);
            });

            ssh.exec('pwds').then(function (result) {
                _ErrorHandler2.default.instance.info('STDOUasdasdsadT: ' + result);
                //resolove(ssh)
            }).catch(function (e) {
                _ErrorHandler2.default.instance.error('bad command', e);
            });

            ssh.putFile(filePath, '/var/deployer/preCleaned').then(function (result) {
                ssh.execCommand("sed -e 's/\\r//g' preCleaned > provision121.sh", { cwd: '/var/deployer', stream: 'stdout' }).then(function (result) {
                    _ErrorHandler2.default.instance.info(result, 'dasdasdasdasdasds');
                    ssh.exec('cd /var/deployer && screen -S bash provision121.sh').then(function (result) {
                        console.log('whats the fuxc1');
                        console.log(result.stdout);
                        _ErrorHandler2.default.instance.info(result);
                    }).catch(function (e) {
                        console.log('whats the fuxc2');
                        _ErrorHandler2.default.instance.info(e);
                    });
                }).catch(function (error) {
                    _ErrorHandler2.default.instance.error('Something went wrong with provisioning \n' + error);
                });
            }).catch(function (error) {
                _ErrorHandler2.default.instance.error('Provision file could not be written to server ' + error);
            });

            //
            // this.checkIfProvisioned().then((provisioned) => {
            //     console.log('server has been provisoned')
            // }).catch(notProvisioned => {
            //     ssh.putFile(filePath, '/var/deployer/preCleaned')
            //         .then(result => {
            //             ssh.execCommand("sed 's/^M$//' preCleaned > provision.sh", {cwd: '/var/deployer', stream: 'stdout'})
            //                 .then(result => {
            //                     ErrorHandler.instance.info(result);
            //                 })
            //                 .catch(error => {
            //                     ErrorHandler.instance.error('Something went wrong with provisioning \n' + error)
            //                 })
            //         })
            //         .catch(error => {
            //             ErrorHandler.instance.error('Provision file could not be written to server ' + error)
            //         })
            //     ssh.execCommand('bash provision.sh', {cwd: '/var/deployer', stream: 'stdout'})
            //         .then( result => {
            //             ErrorHandler.instance.info(result)
            //         })
            //         .catch( error => {
            //
            //         })
            // })

            /**/
        }

        /* see a way to auto add key to known hosts*/

    }, {
        key: 'checkConnection',
        value: function checkConnection() {
            var _this3 = this;

            var _this = this;
            return new Promise(function (resolove, reject) {
                ssh.connect({
                    host: _this3.host,
                    username: _this3.user,
                    privateKey: _this3.key
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
                        _ErrorHandler2.default.instance.info('STDOUT: ' + result);
                        resolove(ssh);
                    });
                }).catch(function (error) {
                    _this.isConnection = false;
                    _ErrorHandler2.default.instance.error(error);
                    reject(false);
                    ssh.dispose();
                });
            });
        }
    }, {
        key: 'checkIfProvisioned',
        value: function checkIfProvisioned() {
            var _this = this;
            return new Promise(function (resolove, reject) {
                console.log('where going');
                ssh.getFile('/home/' + _this.user + '/.provisioned', isProvisionedPath).then(function (contents) {
                    _ErrorHandler2.default.instance.info('Server has been previously provisioned' + contents);
                    _files2.default.removeFile(isProvisionedPath);
                    resolve(true);
                }).catch(function (notProvisionedError) {
                    _ErrorHandler2.default.instance.error('Server has not been provisioned ' + notProvisionedError);
                    reject(false);
                });
            });
        }
    }, {
        key: 'isConnection',
        get: function get() {
            return this._isConnection;
        },
        set: function set(value) {
            this._isConnection = value;
        }
    }, {
        key: 'sshConfig',
        set: function set(value) {
            this._sshConfig = value;
        },
        get: function get() {
            return this._sshConfig;
        }
    }, {
        key: 'key',
        get: function get() {
            return this._key;
        },
        set: function set(value) {
            try {
                if (!_files2.default.fileExists(value)) throw 'key file does not exist';
            } catch (error) {
                _Log.log(error);
            }
            this._key = value;
        }
    }, {
        key: 'user',
        get: function get() {
            return this._user;
        },
        set: function set(value) {
            try {
                if (value.length < 1) throw 'Please enter a user';
                this._user = value;
            } catch (error) {
                _Log.log(error);
            }
        }
    }, {
        key: 'host',
        get: function get() {
            return this._host;
        },
        set: function set(value) {
            try {
                var re = new RegExp("^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$.");
                if (!re.test(value)) throw 'Host must be an ip';
                this._host = value;
            } catch (error) {
                _Log.log(error);
            }
        }
    }]);

    return SSH;
}();

exports.default = SSH;