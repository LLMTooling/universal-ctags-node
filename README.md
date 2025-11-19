<div align="center">

# code-search-mcp-universal-ctags

**Node.js package bundling universal-ctags binaries for cross-platform code indexing**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](package.json)
[![Platform Support](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](#platform-support)

</div>

---

## Overview

`code-search-mcp-universal-ctags` provides pre-built universal-ctags binaries for Node.js projects, eliminating the need for manual installation. The package automatically downloads and configures the appropriate binary for your platform during installation.

This package is designed for use with the Model Context Protocol (MCP) and other code analysis tools that require universal-ctags functionality.

---

## Features

<div align="center">

| Feature | Status | Notes |
|---------|--------|-------|
| Automatic Binary Download | ✅ Full | Downloads during npm install |
| Cross-Platform Support | ✅ Full | Windows, macOS, Linux |
| Zero Configuration | ✅ Full | Works out of the box |
| ARM64 Support | ✅ Full | Native Apple Silicon and ARM Linux |
| Offline Fallback | ✅ Full | Manual installation instructions provided |
| GitHub Token Support | ✅ Full | Respects GITHUB_TOKEN for rate limits |

</div>

---

## Installation

### From GitHub Packages

This package is published to GitHub Packages and requires authentication to install.

#### Step 1: Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `read:packages` scope
3. Copy the token

#### Step 2: Configure npm Authentication

Create or update `.npmrc` in your project root or home directory:

```
@LLMTooling:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Replace `YOUR_GITHUB_TOKEN` with your personal access token.

#### Step 3: Install the Package

```bash
npm install @LLMTooling/code-search-mcp-universal-ctags
```

**Alternative: Using environment variable**

```bash
echo "@LLMTooling:registry=https://npm.pkg.github.com" > .npmrc
export NODE_AUTH_TOKEN=YOUR_GITHUB_TOKEN
npm install @LLMTooling/code-search-mcp-universal-ctags
```

---

## Usage

### Basic Usage

```javascript
const { ctagsPath } = require('@LLMTooling/code-search-mcp-universal-ctags');

console.log('ctags binary location:', ctagsPath);
// Use ctagsPath with child_process to run ctags commands
```

### With Child Process

```javascript
const { execSync } = require('child_process');
const { ctagsPath } = require('@LLMTooling/code-search-mcp-universal-ctags');

// Get ctags version
const version = execSync(`"${ctagsPath}" --version`, { encoding: 'utf8' });
console.log(version);

// Generate tags for a project
execSync(`"${ctagsPath}" -R --fields=+nKz --extras=+q .`, { cwd: '/path/to/project' });
```

### With Spawn

```javascript
const { spawn } = require('child_process');
const { ctagsPath } = require('@LLMTooling/code-search-mcp-universal-ctags');

const ctags = spawn(ctagsPath, ['--version']);

ctags.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ctags.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});
```

---

## Platform Support

<div align="center">

| Platform | Architecture | Status | Binary Source |
|----------|--------------|--------|---------------|
| Windows | x64 | ✅ Supported | [ctags-win32](https://github.com/universal-ctags/ctags-win32) |
| Windows | x86 | ✅ Supported | [ctags-win32](https://github.com/universal-ctags/ctags-win32) |
| macOS | x64 (Intel) | ✅ Supported | [ctags-nightly-build](https://github.com/universal-ctags/ctags-nightly-build) |
| macOS | ARM64 (Apple Silicon) | ✅ Supported | [ctags-nightly-build](https://github.com/universal-ctags/ctags-nightly-build) |
| Linux | x64 | ✅ Supported | [ctags-nightly-build](https://github.com/universal-ctags/ctags-nightly-build) |
| Linux | ARM64 | ✅ Supported | [ctags-nightly-build](https://github.com/universal-ctags/ctags-nightly-build) |

</div>

---

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/LLMTooling/code-search-mcp-universal-ctags.git
cd code-search-mcp-universal-ctags

# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Running Tests

The package includes comprehensive tests that verify:

- Binary download and extraction
- Binary executable permissions
- Binary functionality (version check)
- Tag generation capabilities

```bash
npm test
```

---

## Testing Across Platforms

The project includes GitHub Actions workflows for automated testing on all supported platforms:

<div align="center">

| Workflow | Purpose | Trigger |
|----------|---------|---------|
| Platform Tests | Test on Windows, macOS (x64/ARM64), Linux | Manual, Push, PR |
| Publish | Publish to GitHub Packages | Manual, Release |

</div>

To run platform tests manually, trigger the "Platform Tests" workflow from the GitHub Actions tab.

---

## Architecture

### Package Structure

```
code-search-mcp-universal-ctags/
├── lib/
│   ├── index.js          # Main entry point
│   ├── postinstall.js    # Download and setup logic
│   └── util.js           # Helper functions
├── test/
│   └── basic.test.js     # Test suite
├── bin/                  # Created during install (git-ignored)
│   └── ctags(.exe)       # Platform-specific binary
└── package.json
```

### How It Works

1. **Installation**: When you run `npm install`, the postinstall script executes
2. **Platform Detection**: Determines your OS and architecture
3. **Download**: Fetches the appropriate binary from GitHub releases
4. **Extraction**: Extracts the binary to the `bin/` directory
5. **Permissions**: Sets executable permissions on Unix systems
6. **Verification**: Main module verifies binary exists before exporting path

---

## Environment Variables

<div align="center">

| Variable | Purpose | Default |
|----------|---------|---------|
| `GITHUB_TOKEN` | GitHub API authentication (avoids rate limits) | None |
| `SKIP_POSTINSTALL` | Skip automatic binary download | `false` |

</div>

### Using GITHUB_TOKEN

To avoid GitHub API rate limits:

```bash
export GITHUB_TOKEN=your_github_token
npm install
```

### Skipping Postinstall

If you want to install the package without downloading the binary:

```bash
SKIP_POSTINSTALL=1 npm install
```

---

## Manual Installation

If automatic installation fails, you can install universal-ctags manually:

### macOS

```bash
brew install universal-ctags
```

### Linux (Ubuntu/Debian)

```bash
sudo apt install universal-ctags
```

### Linux (Snap)

```bash
sudo snap install universal-ctags
```

### Windows

Download the latest release from:
[https://github.com/universal-ctags/ctags-win32/releases](https://github.com/universal-ctags/ctags-win32/releases)

---

## Troubleshooting

### Binary Not Found

If you see an error about the binary not being found:

1. Ensure the postinstall script ran successfully
2. Check that the `bin/` directory exists
3. Try reinstalling: `rm -rf node_modules && npm install`

### Download Failures

If the download fails:

1. Check your internet connection
2. Verify GitHub is accessible
3. Try using a GITHUB_TOKEN to avoid rate limits
4. Consider manual installation

### Permission Errors (Unix)

If you encounter permission errors:

```bash
chmod +x node_modules/@LLMTooling/code-search-mcp-universal-ctags/bin/ctags
```

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Universal Ctags](https://github.com/universal-ctags/ctags) - The main ctags project
- [ctags-win32](https://github.com/universal-ctags/ctags-win32) - Windows binaries
- [ctags-nightly-build](https://github.com/universal-ctags/ctags-nightly-build) - Unix binaries
- [vscode-ripgrep](https://github.com/microsoft/vscode-ripgrep) - Inspiration for package structure

---

<div align="center">

**Built for the Model Context Protocol ecosystem**

</div>
