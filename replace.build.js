const replace = require('replace-in-file');
const args = require('yargs').argv;

var buildVersion = args.buildVersion
var timestamp = args.timestamp

const options = {
    files: ['src/app-config/prd/appconfig.json', 'src/assets/config/appconfig.json'],
    from: /INSERT_BUILD_NUMBER_HERE/g,
    to:  buildVersion + ' ' + timestamp,
    allowEmptyPaths: false,
};

try {
    let changedFiles = replace.sync(options);
    if (changedFiles == 0) {
        throw "Please make sure that file '" + options.files + "' has \"buildVersion: ''\"";
    }
    console.log('Build version set: ' + buildVersion + ' ' + timestamp);
}
catch (error) {
    console.error('Error occurred:', error);
    throw error
}
