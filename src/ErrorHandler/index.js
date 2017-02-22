const singleton = Symbol();
const singletonEnforcer = Symbol();

import files from '../lib/files'


var Log = require('log')
    , fs = require('fs')
    , stream = fs.createWriteStream(files.getCurrentDirectoryBase() + '/../file.log', { flags: 'a' })
    , log = new Log('debug', stream);


class ErrorHandler {
    constructor(enforcer) {
        if(enforcer != singletonEnforcer) throw "Cannot construct singleton";
    }

    static get instance() {
        if (!this[singleton]) {
            this[singleton] = new ErrorHandler(singletonEnforcer);
        }

        return this[singleton];
    }

    info(message) {
        log.info(message)
    }

    error(message) {
        log.error(message)
    }
}

export default ErrorHandler