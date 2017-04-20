'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _files = require('../lib/files');

var _files2 = _interopRequireDefault(_files);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');

var config = function () {
    /*File name is optional. If no filename that means a config file doesn't exist
     The create function must be called to a new config file.*/
    function config(fileName) {
        _classCallCheck(this, config);

        this.fileName = fileName || null;
        if (this.fileName) {
            this.file = require(_files2.default.getCurrentWorkingDirectory() + this.fileName);
        }
    }

    /*Create a new config file, will overwrite any existing file if there is one.*/


    _createClass(config, [{
        key: 'create',
        value: function create(fileName, data) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _this.fileName = fileName;
                _this.file = _files2.default.getCurrentWorkingDirectory() + fileName;

                fs.writeFileSync(_this.file, "{}");

                _this.file = require(_this.file);

                _this.writeAll(data).then(function (result) {
                    resolve(_this);
                });
            });
        }

        /*Write add or over write data in the config file. takes a key and a value*/

    }, {
        key: 'write',
        value: function write(key, value) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                if (!_files2.default.fileExists(_this2.fileName)) {
                    resolve('fail');
                    return;
                }

                _this2.file[key] = value;
                var that = _this2;

                fs.writeFileSync(_this2.fileName, JSON.stringify(_this2.file, null, '  '));
                //console.log(JSON.stringify(that.file, null, '  '));
                //console.log('writing to ' + that.fileName);
                resolve(_this2);
            });
        }

        /* A quick way to add multiple data enteries to the config file. Accepts a data object*/

    }, {
        key: 'writeAll',
        value: function writeAll(data) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        _this3.write(key, data[key]);
                    }
                }
                resolve(_this3);
            });
        }
    }, {
        key: 'read',
        value: function read() {
            return JSON.parse(fs.readFileSync(this.fileName, 'utf8'));
        }
    }]);

    return config;
}();

exports.default = config;