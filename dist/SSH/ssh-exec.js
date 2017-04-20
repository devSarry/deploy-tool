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

var exec = require('ssh-exec');

var ssh = new _nodeSsh2.default();
var isProvisionedPath = _files2.default.getCurrentDirectoryBase() + '/.provisioned';

var SSH = function () {
    function SSH(user, host, key) {
        var _this2 = this;

        var config = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

        _classCallCheck(this, SSH);

        this._host = host;
        this._user = user;
        this._key = key;

        this._config = config;

        this._workingDirectory = '/home/' + user + '/';

        return new Promise(function (resolve) {
            _this2.checkConnection().then(function (value) {
                console.log('connected');
                resolve(_this2);
            });
        });
    }

    _createClass(SSH, [{
        key: 'checkConnection',
        value: function checkConnection() {
            var _this3 = this;

            var _this = this;
            return new Promise(function (resolove, reject) {
                ssh.connect({
                    host: _this3._host,
                    username: _this3._user,
                    privateKey: _this3._key
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
                        _ErrorHandler2.default.instance.info('STDOUT: ' + result);
                        resolove(ssh);
                    });
                }).catch(function (error) {
                    _this.isConnection = false;
                    _ErrorHandler2.default.instance.error(error);
                    console.log('Connection failed:', error);
                    reject(false);
                });
            });
        }
    }, {
        key: 'checkCurrentDir',
        value: function checkCurrentDir() {
            var _this = this;
            return new Promise(function (resolve, err) {
                ssh.exec('pwd').then(function (result) {
                    _ErrorHandler2.default.instance.info('STDOUT SHOUDS: ' + result);
                    console.log(result);
                    resolve(_this);
                });
            });
        }
    }, {
        key: 'provision',
        value: function provision(file, path) {
            var _this4 = this;

            var filePath = 'server/compiled/Provision/' + file;
            var cleanFile = 'clean_' + file;
            path = path ? path : this._workingDirectory;

            console.log('the path is ', path, filePath);

            return new Promise(function (resolve, error) {
                _ErrorHandler2.default.instance.info('Provision file: ' + filePath);
                _this4.checkIfProvisioned().then(function (provisioned) {
                    if (!provisioned) {
                        _this4.uploadScript(path, filePath, file).then(function (result) {
                            console.log('upload script: ' + result);
                            _this4.runProvision(path, file).then(function (result) {
                                resolve(_this4);
                            });
                        });
                    }
                });
            });
        }
    }, {
        key: 'runProvision',
        value: function runProvision(cwd, cleanFile) {
            var _this5 = this;

            return new Promise(function (resolve) {
                console.log('run provision');
                exec('cd ' + cwd + '&& bash ' + cleanFile, {
                    user: _this5._user,
                    host: _this5._host,
                    key: _this5._key
                }, function (err, stdout, stderr) {
                    _ErrorHandler2.default.instance.info(stdout);
                    resolve(this);
                }).pipe(process.stdout);
            });
        }
    }, {
        key: 'uploadScript',
        value: function uploadScript(cwd, filePath, file) {
            filePath = _files2.default.getCurrentWorkingDirectory() + filePath;
            var preCleanedFile = 'pre_cleaned_' + file;

            cwd = cwd ? cwd : this._workingDirectory;

            var preCleanedRemote = cwd + '/' + preCleanedFile;

            console.log(filePath, cwd, preCleanedRemote, file);

            return ssh.putFile(filePath, preCleanedRemote).then(function (result) {
                console.log('script ' + file + ' uploaded!!');
                _ErrorHandler2.default.instance.info('script uploaded: ' + result);
                ssh.execCommand("sed 's/\\r//' " + preCleanedFile + "> " + file, { cwd: cwd, stream: 'stdout' });
            }).catch(function (e) {
                _ErrorHandler2.default.instance.error(e);
            });
        }
    }, {
        key: 'checkIfProvisioned',
        value: function checkIfProvisioned() {
            var _this = this;
            return ssh.getFile('/home/' + _this.user + '/.provisioned', isProvisionedPath).then(function (contents) {
                console.log('server has been previously pro');
                _ErrorHandler2.default.instance.info('Server has been previously provisioned' + contents);
                //files.removeFile(isProvisionedPath);
                return true;
            }).catch(function (notProvisionedError) {
                _ErrorHandler2.default.instance.error('Server has not been provisioned ' + notProvisionedError);
                return false;
            });
        }
    }, {
        key: 'createProject',
        value: function createProject(gitRepo, domain) {
            var _this6 = this;

            return new Promise(function (resolve, error) {
                ssh.execCommand('git clone ' + gitRepo + ' ' + domain + ' && cd ' + domain + ' && composer install && npm install', { cwd: '/home/' + _this6._user });
                resolve(_this6);
            });
        }
    }, {
        key: 'deploySite',
        value: function deploySite(domain) {
            var _this7 = this;

            var cwd = '/home/' + this._user + '/' + domain;
            return new Promise(function (resolve, error) {
                _this7.uploadScript(cwd, 'server/compiled/nginx_conf/serve-site.sh', domain).then(function (res) {
                    ssh.execCommand('sudo bash serve-site', { cwd: cwd, stream: 'stdout' });
                });
                resolve(_this7);
            });
        }
    }, {
        key: 'projectExists',
        value: function projectExists() {
            return new Promise(function (resolve, error) {
                ssh.execCommand('ls -r /var/project/site.git/.project', { stream: 'both' }).then(function (response) {
                    if (response.stdout === '/var/project/site.git/.project') {
                        _ErrorHandler2.default.instance.info('Project exists:', response.stdout);
                        resolve(true);
                    } else {
                        _ErrorHandler2.default.instance.error('Project not created:', response.stderr);
                        resolve(false);
                    }
                });
            });
        }
    }, {
        key: 'createProjectDir',
        value: function createProjectDir(domain) {
            var _this8 = this;

            var projectPath = '/var/project/' + domain + '.git';

            return ssh.execCommand('mkdir -p ' + projectPath).then(function (result) {
                _ErrorHandler2.default.instance.info('create project dir', result.stdout);
            }).then(function () {
                return ssh.execCommand('git init ' + projectPath + ' --bare');
            }).then(function () {
                return _this8.uploadScript('gitPost.sh', projectPath + '/hooks/post-receive');
            }).then(function () {
                ssh.execCommand('chmod +x ' + projectPath + '/hooks/post-receive');
            }).then(function () {
                ssh.execCommand('touch ' + projectPath + '.project');
            });
        }
    }]);

    return SSH;
}();

exports.default = SSH;