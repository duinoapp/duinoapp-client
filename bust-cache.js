const fs = require('fs');
const { version } = require('./package.json');

let swFile = fs.readFileSync('./service-worker.js', 'utf-8');
swFile = swFile.replace(/LATEST_VERSION = '[0-9.]+';/, `LATEST_VERSION = '${version}';`);
fs.writeFileSync('./service-worker.js', swFile);
