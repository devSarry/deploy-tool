var fs = require('fs');
var path = require('path');



module.exports = {
    getCurrentDirectoryBase: function () {
        return path.basename(process.cwd());
    },

    directoryExists: function (filePath) {
        try {
            return fs.statSync(filePath).isDirectory();
        } catch (error) {
            return false;
        }
    },
    fileExists: function (filePath) {
        try {
            return fs.statSync(filePath).isFile();
        } catch (error) {
            return false
        }
    },
    removeFile: function (filePath) {
        try {
            return fs.unlinkSync(filePath)
        } catch (error) {
            return false
        }
    }
};