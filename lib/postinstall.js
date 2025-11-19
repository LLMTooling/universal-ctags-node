/**
 * Postinstall script - downloads and extracts platform-specific ctags binary
 */
const fs = require('fs');
const path = require('path');
const {
  getPlatform,
  getLatestRelease,
  downloadFile,
  extractTarGz,
  extractZip,
  setExecutable
} = require('./util');

/**
 * Get download URL for platform-specific binary
 * @param {Object} platformInfo - Platform information from getPlatform()
 * @param {string} version - Version/tag to download
 * @returns {Object} Object containing downloadUrl and archiveName
 */
function getDownloadInfo(platformInfo, version) {
  const { platform, arch, isWindows, isMac, isLinux } = platformInfo;

  if (isWindows) {
    // Windows: use ctags-win32 releases
    // Format: ctags-{version}-x64.zip or ctags-{version}-x86.zip
    const winArch = arch === 'x86_64' ? 'x64' : 'x86';
    return {
      downloadUrl: `https://github.com/universal-ctags/ctags-win32/releases/download/${version}/ctags-${version}-${winArch}.zip`,
      archiveName: 'ctags.zip'
    };
  } else {
    // Unix (macOS/Linux): use ctags-nightly-build releases
    // Format: uctags-{version}-{platform}-{arch}.tar.gz
    let platformName;
    if (isMac) {
      platformName = 'darwin';
    } else if (isLinux) {
      platformName = 'linux';
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return {
      downloadUrl: `https://github.com/universal-ctags/ctags-nightly-build/releases/download/${version}/uctags-${version}-${platformName}-${arch}.tar.gz`,
      archiveName: 'ctags.tar.gz'
    };
  }
}

/**
 * Main postinstall function
 */
async function postinstall() {
  const platformInfo = getPlatform();
  const { platform, arch, isWindows } = platformInfo;

  console.log(`Installing universal-ctags for ${platform}-${arch}...`);

  // Create bin directory
  const binDir = path.join(__dirname, '..', 'bin');
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  try {
    // Get latest release version
    let version;
    let downloadInfo;

    if (isWindows) {
      // For Windows, get latest from ctags-win32
      console.log('Fetching latest Windows release...');
      version = await getLatestRelease('universal-ctags/ctags-win32');
      console.log(`Latest version: ${version}`);
      downloadInfo = getDownloadInfo(platformInfo, version);
    } else {
      // For Unix, get latest from ctags-nightly-build
      console.log('Fetching latest release...');
      version = await getLatestRelease('universal-ctags/ctags-nightly-build');
      console.log(`Latest version: ${version}`);
      downloadInfo = getDownloadInfo(platformInfo, version);
    }

    const archivePath = path.join(binDir, downloadInfo.archiveName);

    // Download binary
    console.log(`Downloading from: ${downloadInfo.downloadUrl}`);
    await downloadFile(downloadInfo.downloadUrl, archivePath);
    console.log('Download complete');

    // Extract archive
    console.log('Extracting archive...');
    if (isWindows) {
      await extractZip(archivePath, binDir);
    } else {
      await extractTarGz(archivePath, binDir);
    }

    // Set executable permissions on Unix
    if (!isWindows) {
      const ctagsPath = path.join(binDir, 'ctags');
      setExecutable(ctagsPath);
      console.log('Set executable permissions');
    }

    // Clean up archive
    if (fs.existsSync(archivePath)) {
      fs.unlinkSync(archivePath);
    }

    // Verify the binary exists
    const binaryName = isWindows ? 'ctags.exe' : 'ctags';
    const binaryPath = path.join(binDir, binaryName);

    if (!fs.existsSync(binaryPath)) {
      throw new Error(`Binary not found at ${binaryPath} after extraction`);
    }

    console.log('Installation complete');
    console.log(`Binary location: ${binaryPath}`);
  } catch (error) {
    console.error('Failed to install universal-ctags:', error.message);
    console.error('\nYou may need to install universal-ctags manually:');
    console.error('  - macOS: brew install universal-ctags');
    console.error('  - Linux: apt install universal-ctags or snap install universal-ctags');
    console.error('  - Windows: Download from https://github.com/universal-ctags/ctags-win32/releases');
    console.error('\nAlternatively, set SKIP_POSTINSTALL=1 to skip automatic installation.');
    process.exit(1);
  }
}

// Skip postinstall if environment variable is set
if (process.env.SKIP_POSTINSTALL) {
  console.log('Skipping postinstall (SKIP_POSTINSTALL is set)');
  process.exit(0);
}

// Run postinstall
postinstall().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
