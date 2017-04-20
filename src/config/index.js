import files from '../lib/files';

var fs = require('fs');

class config {
    /*File name is optional. If no filename that means a config file doesn't exist
     The create function must be called to a new config file.*/
    constructor(fileName) {
        this.fileName = fileName || null;
        if (this.fileName) {
            this.file = require(files.getCurrentWorkingDirectory() + this.fileName)
        }
    }

    /*Create a new config file, will overwrite any existing file if there is one.*/
    create(fileName, data) {
        return new Promise((resolve, reject) => {
            this.fileName = fileName;
            this.file = files.getCurrentWorkingDirectory() + fileName;

            fs.writeFileSync(this.file, "{}");

            this.file = require(this.file);

            this.writeAll(data).then(result => {
                resolve(this);
            });
        });
    }

    /*Write add or over write data in the config file. takes a key and a value*/
    write(key, value) {
        return new Promise((resolve, reject) => {
            if( !files.fileExists(this.fileName)){
                resolve('fail');
                return
            }

            this.file[key] = value;
            let that = this;

            fs.writeFileSync(this.fileName, JSON.stringify(this.file, null, '  '));
            //console.log(JSON.stringify(that.file, null, '  '));
            //console.log('writing to ' + that.fileName);
            resolve(this);
        })
    }

    /* A quick way to add multiple data enteries to the config file. Accepts a data object*/
    writeAll(data) {
        return new Promise((resolve, reject) => {
            for(var key in data){
                if (data.hasOwnProperty(key)) {
                    this.write(key, data[key]);
                }
            }
            resolve(this)
        })
    }

    read() {
        return JSON.parse(fs.readFileSync(this.fileName, 'utf8'));
    }
}
export default config