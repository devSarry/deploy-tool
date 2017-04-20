"use strict";

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var data = {
    "new1": "apple",
    "new12": "penis",
    "new13": "penis",
    "new14": "penis",
    "new15": "penis",
    "new11": "apple"
};

var conf = new _index2.default().create('configuration.json', data).then(function (config) {
    console.log(result);
    config.write('new12', 'italy');
});