
import config from './index';

let data = {
    "new1": "apple",
    "new12": "penis",
    "new13": "penis",
    "new14": "penis",
    "new15": "penis",
    "new11": "apple"
}

var conf = new config().create('configuration.json',data).then(config => {
    console.log(result);
    config.write('new12', 'italy');
});