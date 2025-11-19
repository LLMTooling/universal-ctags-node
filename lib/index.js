/**
 * Main entry point - exports path to ctags binary
 */
const path = require('path');
const fs = require('fs');

const binaryName = process.platform === 'win32' ? 'ctags.exe' : 'ctags';
const ctagsPath = path.join(__dirname, '..', 'bin', binaryName);

// Verify binary exists
if (!fs.existsSync(ctagsPath)) {
  throw new Error(
    `ctags binary not found at ${ctagsPath}. ` +
    'Please ensure the package was installed correctly and postinstall script ran.'
  );
}

module.exports = { ctagsPath };
