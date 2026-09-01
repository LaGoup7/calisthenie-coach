const fs = require('fs');
const path = require('path');

const APP_SOURCE_FILES = [
  'app.js',
  'app-adaptive.js',
  'app-planning.js',
  'app-progress.js',
  'app-body.js',
  'app-journey.js',
];

function loadAppSource(root = __dirname) {
  return APP_SOURCE_FILES
    .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
    .join('\n');
}

module.exports = { APP_SOURCE_FILES, loadAppSource };
