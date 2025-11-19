# Universal Ctags Bundler Package Specification

## Project Overview

Build `code-search-mcp-universal-ctags` - an npm package that bundles universal-ctags binaries for cross-platform use, similar to how `@vscode/ripgrep` works.

(Note by NPM package, I want you to build a github workflow that publishes this to the github package npm registry or whatever it is,
Then I will install it via github npm package registry in my other projects, I don't want this on npm directly.)

## Repo URL (already set up but private for now)
https://github.com/LLMTooling/code-search-mcp-universal-ctags


## Reference Implementation

**Model after:** https://github.com/microsoft/vscode-ripgrep

Key concepts from vscode-ripgrep:
- Postinstall script detects platform and downloads appropriate binary
- Exports path to binary for easy usage
- Minimal dependencies
- Supports proxy configuration and GitHub API tokens

## Binary Sources

### Windows
- **Repository:** https://github.com/universal-ctags/ctags-win32
- **Releases:** https://github.com/universal-ctags/ctags-win32/releases
- **Format:** ZIP archives
- **Binary name:** `ctags.exe`
- **Typical filename:** `ctags-{version}-x64.zip` or `ctags-{version}-x86.zip`

### macOS & Linux
- **Repository:** https://github.com/universal-ctags/ctags-nightly-build
- **Releases:** https://github.com/universal-ctags/ctags-nightly-build/releases
- **Format:** Tarball archives (`.tar.gz`)
- **Binary name:** `ctags`
- **Platforms:** darwin-x64, darwin-arm64, linux-x64, linux-arm64, etc.
- **Typical filename:** `uctags-{version}-{platform}.tar.gz`

## Package Structure

```
@code-search-mcp/universal-ctags/
├── package.json
├── README.md
├── LICENSE
├── .gitignore
├── .npmignore
├── lib/
│   ├── index.js          # Main entry point, exports ctagsPath
│   ├── postinstall.js    # Downloads and extracts binary
│   └── util.js           # Helper functions (platform detection, download)
├── bin/                  # Created during postinstall, git-ignored
│   └── ctags(.exe)       # Platform-specific binary
└── test/
    └── basic.test.js     # Verify binary works
```

## package.json

```json
{
  "name": "code-search-mcp-universal-ctags",
  "version": "0.1.0",
  "description": "Node module for using universal-ctags with pre-built binaries",
  "main": "lib/index.js",
  "scripts": {
    "postinstall": "node lib/postinstall.js",
    "test": "node test/basic.test.js"
  },
  "keywords": [
    "ctags",
    "universal-ctags",
    "code-search",
    "mcp"
  ],
  "author": "GhostTypes",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/LLMTooling/code-search-mcp-universal-ctags"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "files": [
    "lib/**/*.js",
    "README.md",
    "LICENSE"
  ],
  "dependencies": {},
  "devDependencies": {}
}
```

## Implementation Details

### lib/index.js

```javascript
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
```

### lib/postinstall.js

Core logic:

```javascript
const https = require('https');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { pipeline } = require('stream');
const zlib = require('zlib');

const streamPipeline = promisify(pipeline);

// Platform detection
function getPlatform() {
  const platform = process.platform;
  const arch = process.arch;

  // Map Node.js platform names to ctags release naming
  const platformMap = {
    'win32': 'windows',
    'darwin': 'macos',
    'linux': 'linux'
  };

  const archMap = {
    'x64': 'x86_64',
    'arm64': 'aarch64',
    'ia32': 'x86'
  };

  return {
    platform: platformMap[platform] || platform,
    arch: archMap[arch] || arch,
    isWindows: platform === 'win32'
  };
}

// Download binary from GitHub releases
async function downloadBinary(url, destPath) {
  const response = await httpsGet(url);

  if (response.statusCode === 302 || response.statusCode === 301) {
    // Follow redirect
    return downloadBinary(response.headers.location, destPath);
  }

  if (response.statusCode !== 200) {
    throw new Error(`Download failed: ${response.statusCode}`);
  }

  await streamPipeline(response, fs.createWriteStream(destPath));
}

// Extract archive (ZIP for Windows, tar.gz for Unix)
async function extractArchive(archivePath, destDir, isWindows) {
  if (isWindows) {
    // Extract ZIP (Windows)
    // Use built-in unzipper or simple extraction
    await extractZip(archivePath, destDir);
  } else {
    // Extract tar.gz (Unix)
    await extractTarGz(archivePath, destDir);
  }
}

// Main postinstall logic
async function postinstall() {
  const binDir = path.join(__dirname, '..', 'bin');
  const { platform, arch, isWindows } = getPlatform();

  // Create bin directory
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  // Determine download URL based on platform
  const version = 'latest'; // or specific version/tag
  let downloadUrl;

  if (isWindows) {
    // Windows: use ctags-win32 releases
    downloadUrl = `https://github.com/universal-ctags/ctags-win32/releases/download/${version}/ctags-${version}-x64.zip`;
  } else {
    // Unix: use ctags-nightly-build releases
    downloadUrl = `https://github.com/universal-ctags/ctags-nightly-build/releases/download/${version}/uctags-${platform}-${arch}.tar.gz`;
  }

  console.log(`Downloading universal-ctags for ${platform}-${arch}...`);

  const archivePath = path.join(binDir, isWindows ? 'ctags.zip' : 'ctags.tar.gz');

  try {
    await downloadBinary(downloadUrl, archivePath);
    await extractArchive(archivePath, binDir, isWindows);

    // Set executable permissions on Unix
    if (!isWindows) {
      const ctagsPath = path.join(binDir, 'ctags');
      fs.chmodSync(ctagsPath, 0o755);
    }

    // Clean up archive
    fs.unlinkSync(archivePath);

    console.log('✓ universal-ctags installed successfully');
  } catch (error) {
    console.error('Failed to install universal-ctags:', error.message);
    console.error('You may need to install universal-ctags manually:');
    console.error('  - macOS: brew install universal-ctags');
    console.error('  - Linux: apt install universal-ctags or snap install universal-ctags');
    console.error('  - Windows: Download from https://github.com/universal-ctags/ctags-win32/releases');
    process.exit(1);
  }
}

postinstall().catch(err => {
  console.error(err);
  process.exit(1);
});
```

### Key Implementation Notes

1. **Platform-Specific Details:**
   - Windows: Binary is in root of ZIP as `ctags.exe`
   - Unix: Binary might be in `bin/` subdirectory of tarball
   - Need to find and extract correct file from archive

2. **Error Handling:**
   - Gracefully fail if download fails
   - Provide manual installation instructions
   - Don't block npm install completely

3. **Version Strategy:**
   - Option A: Use specific release tag (e.g., `p6.1.20250124.0`)
   - Option B: Use `latest` release
   - Recommend: Pin to specific recent version for stability

## Testing

Set up 3 platform specific tests:
- Windows
- Linux
- MacOS

Then set up a github workflow I can run manually , which runs each platform specific test in it's platform specific runner (find the up to date versions before you implement to avoid issues)

This way I can fire off tests for all platforms all at once and run bulk test/fix iterations if needed

## Edge Cases to Handle

1. **Architecture Detection:**
   - ARM Macs (M1/M2) need `darwin-arm64`
   - Fallback to x64 if arm64 not available

2. **Archive Formats:**
   - Windows: ZIP files
   - Unix: tar.gz files
   - Binary location varies in archives

3. **Permissions:**
   - Unix needs chmod +x on binary
   - Windows doesn't need permission changes

4. **Network Issues:**
   - Timeout handling
   - Retry logic for transient failures
   - Clear error messages

## Reference: Similar Packages to Study

1. **@vscode/ripgrep** - Primary reference
   - https://github.com/microsoft/vscode-ripgrep
   - Clean postinstall implementation
   - Good error handling

2. **@lvce-editor/ripgrep** - Alternative approach
   - Direct downloads without GitHub API
   - Simpler implementation

3. **universal-ctags (old)** - What NOT to do
   - https://github.com/harmsk/universal-ctags.js
   - Emscripten compilation approach (outdated)
   - Windows support issues

4. FlashForgeUI-Electron
  - https://github.com/Parallel-7/FlashForgeUI-Electron
  - Make a temporary clone of this repo to check the README.md file
  - Follow similar (centered) structure when writing the README.md file for this project
  - Avoid using emojis anywhere , keeping it professional
  - Use centered tables over bulleted lists, these render better




## Deployment Checklist

- [ ] Create GitHub repository
- [ ] Implement package structure
- [ ] Set up the latest version of ESLint
- [ ] Build the entire project
- [ ] Set up github package/publish workflow 
- [ ] Write platform specific tests
- [ ] Write platform specific tests runner (manual github workflow)
- [ ] Write comprehensive README based on FlashForgeUI README structure and previous guidelines

## Success Criteria

- ✅ Package installs successfully on Windows, macOS, Linux
- ✅ Binary is executable and runs `--version` command
- ✅ Exports `ctagsPath` correctly
- ✅ Handles errors gracefully with helpful messages
- ✅ Package size is reasonable (< 5MB including binary)
