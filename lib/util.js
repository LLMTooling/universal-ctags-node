/**
 * Utility functions for downloading and extracting ctags binaries
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { pipeline } = require('stream');
const zlib = require('zlib');
const tar = require('tar');

const streamPipeline = promisify(pipeline);

/**
 * Get platform-specific information
 * @returns {Object} Platform information including platform, arch, and isWindows flag
 */
function getPlatform() {
  const platform = process.platform;
  const arch = process.arch;

  // Map Node.js arch names to ctags release naming
  const archMap = {
    'x64': 'x86_64',
    'arm64': 'aarch64',
    'ia32': 'i686'
  };

  return {
    platform,
    arch: archMap[arch] || arch,
    nodeArch: arch,
    isWindows: platform === 'win32',
    isMac: platform === 'darwin',
    isLinux: platform === 'linux'
  };
}

/**
 * Fetch latest release tag from GitHub repository
 * @param {string} repo - Repository in format 'owner/repo'
 * @returns {Promise<string>} Latest release tag
 */
async function getLatestRelease(repo) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repo}/releases/latest`,
      headers: {
        'User-Agent': 'code-search-mcp-universal-ctags'
      }
    };

    // Add GitHub token if available
    if (process.env.GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    https.get(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const release = JSON.parse(data);
            resolve(release.tag_name);
          } catch (err) {
            reject(new Error(`Failed to parse release data: ${err.message}`));
          }
        } else {
          reject(new Error(`GitHub API returned status ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Download a file from a URL
 * @param {string} url - URL to download from
 * @param {string} destPath - Destination file path
 * @param {number} retries - Number of retries (default: 3)
 * @returns {Promise<void>}
 */
async function downloadFile(url, destPath, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await downloadFileOnce(url, destPath);
      return;
    } catch (err) {
      if (attempt === retries) {
        throw err;
      }
      console.log(`Download failed, retrying (${attempt + 1}/${retries})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

/**
 * Download a file from a URL (single attempt)
 * @param {string} url - URL to download from
 * @param {string} destPath - Destination file path
 * @returns {Promise<void>}
 */
function downloadFileOnce(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFileOnce(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with status ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      streamPipeline(response, fileStream)
        .then(resolve)
        .catch(reject);
    });

    request.on('error', reject);
    request.setTimeout(60000, () => {
      request.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

/**
 * Extract a tar.gz archive
 * @param {string} archivePath - Path to the archive
 * @param {string} destDir - Destination directory
 * @returns {Promise<void>}
 */
async function extractTarGz(archivePath, destDir) {
  // Extract the archive
  await tar.extract({
    file: archivePath,
    cwd: destDir,
    strip: 0
  });

  // Find the ctags binary in the extracted files
  const files = fs.readdirSync(destDir, { recursive: true });
  let ctagsBinary = null;

  // Look for ctags binary (usually in bin/ or root)
  for (const file of files) {
    const fullPath = path.join(destDir, file);
    const stats = fs.statSync(fullPath);

    if (!stats.isDirectory() && (file.endsWith('ctags') || file === 'ctags')) {
      ctagsBinary = fullPath;
      break;
    }
  }

  if (!ctagsBinary) {
    throw new Error('Could not find ctags binary in archive');
  }

  // Move binary to the destination directory root
  const targetPath = path.join(destDir, 'ctags');
  if (ctagsBinary !== targetPath) {
    fs.renameSync(ctagsBinary, targetPath);

    // Clean up any extracted directories
    for (const file of files) {
      const fullPath = path.join(destDir, file);
      if (fullPath !== targetPath && fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else if (fullPath !== archivePath) {
          fs.unlinkSync(fullPath);
        }
      }
    }
  }

  return targetPath;
}

/**
 * Extract a ZIP archive (Windows)
 * @param {string} archivePath - Path to the archive
 * @param {string} destDir - Destination directory
 * @returns {Promise<string>} Path to extracted binary
 */
async function extractZip(archivePath, destDir) {
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(archivePath);

  // Extract all files
  zip.extractAllTo(destDir, true);

  // Find ctags.exe in the extracted files
  const files = fs.readdirSync(destDir, { recursive: true });
  let ctagsBinary = null;

  for (const file of files) {
    if (file.endsWith('ctags.exe') || file === 'ctags.exe') {
      ctagsBinary = path.join(destDir, file);
      break;
    }
  }

  if (!ctagsBinary) {
    throw new Error('Could not find ctags.exe in archive');
  }

  // Move binary to the destination directory root
  const targetPath = path.join(destDir, 'ctags.exe');
  if (ctagsBinary !== targetPath) {
    fs.renameSync(ctagsBinary, targetPath);

    // Clean up any extracted directories
    for (const file of files) {
      const fullPath = path.join(destDir, file);
      if (fullPath !== targetPath && fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else if (fullPath !== archivePath) {
          fs.unlinkSync(fullPath);
        }
      }
    }
  }

  return targetPath;
}

/**
 * Set executable permissions on a file (Unix only)
 * @param {string} filePath - Path to the file
 */
function setExecutable(filePath) {
  if (process.platform !== 'win32') {
    fs.chmodSync(filePath, 0o755);
  }
}

module.exports = {
  getPlatform,
  getLatestRelease,
  downloadFile,
  extractTarGz,
  extractZip,
  setExecutable
};
