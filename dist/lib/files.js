'use strict';

var fs = require('fs');
var path = require('path');

module.exports = {
    getCurrentDirectoryBase: function getCurrentDirectoryBase() {
        return path.basename(process.cwd());
    },

    getCurrentWorkingDirectory: function getCurrentWorkingDirectory() {
        return process.cwd() + '/';
    },
    directoryExists: function directoryExists(filePath) {
        try {
            return fs.statSync(filePath).isDirectory();
        } catch (error) {
            return false;
        }
    },
    fileExists: function fileExists(filePath) {
        try {
            return fs.statSync(filePath).isFile();
        } catch (error) {
            return false;
        }
    },
    removeFile: function removeFile(filePath) {
        try {
            return fs.unlinkSync(filePath);
        } catch (error) {
            return false;
        }
    }
};