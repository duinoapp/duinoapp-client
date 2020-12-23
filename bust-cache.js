const fs = require('fs');
const { version } = require('./package.json');

const swFile = fs.readFileSync('./service-worker');
fs.writeFileSync('./service-worker', swFile.replace(/LATEST_VERSION = '[0-9.]+';/, `LATEST_VERSION = '${version}';`));
