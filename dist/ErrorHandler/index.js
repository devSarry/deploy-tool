'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _files = require('../lib/files');

var _files2 = _interopRequireDefault(_files);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var singleton = Symbol();
var singletonEnforcer = Symbol();

var Log = require('log'),
    fs = require('fs'),
    stream = fs.createWriteStream(_files2.default.getCurrentDirectoryBase() + '/../file.log', { flags: 'a' }),
    log = new Log('debug', stream);

var ErrorHandler = function () {
    function ErrorHandler(enforcer) {
        _classCallCheck(this, ErrorHandler);

        if (enforcer != singletonEnforcer) throw "Cannot construct singleton";
    }

    _createClass(ErrorHandler, [{
        key: 'info',
        value: function info(message) {
            log.info(message);
        }
    }, {
        key: 'error',
        value: function error(message) {
            log.error(message);
        }
    }], [{
        key: 'instance',
        get: function get() {
            if (!this[singleton]) {
                this[singleton] = new ErrorHandler(singletonEnforcer);
            }

            return this[singleton];
        }
    }]);

    return ErrorHandler;
}();

exports.default = ErrorHandler;