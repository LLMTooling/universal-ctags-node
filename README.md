<div align="center">

<h1>code-search-mcp-universal-ctags</h1>

<p><b>Node.js package bundling universal-ctags binaries for cross-platform code indexing</b></p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=for-the-badge)](package.json)
[![Platform Support](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg?style=for-the-badge)](#platform-support)

</div>

<div align="center">

<h1>Overview</h1>

<p>Pre-built universal-ctags binaries for Node.js projects, eliminating manual installation complexity. The package automatically downloads and configures platform-specific binaries during installation, providing seamless code indexing capabilities for MCP servers and code analysis tools.</p>

</div>

<div align="center">

<h2>Core Capabilities</h2>

<table>
  <tr>
    <th>Capability</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Automatic Binary Management</td>
    <td>Downloads and configures platform-specific ctags binaries during npm install with zero configuration required.</td>
  </tr>
  <tr>
    <td>Cross-Platform Support</td>
    <td>Native binaries for Windows (x64/x86), macOS (Intel/Apple Silicon), and Linux (x64/ARM64).</td>
  </tr>
  <tr>
    <td>GitHub API Integration</td>
    <td>Respects GITHUB_TOKEN for rate limit management and supports offline fallback installation.</td>
  </tr>
  <tr>
    <td>MCP Ecosystem Ready</td>
    <td>Purpose-built for Model Context Protocol servers requiring universal-ctags functionality.</td>
  </tr>
</table>

</div>

<div align="center">

<h1>Installation</h1>

</div>

<div align="center">

<h2>From GitHub Packages</h2>

<p>This package is published to GitHub Packages and requires authentication to install.</p>

<table>
  <tr>
    <th>Step</th>
    <th>Instructions</th>
  </tr>
  <tr>
    <td><b>1. Create GitHub Personal Access Token</b></td>
    <td>
      Navigate to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)<br>
      Generate new token with <code>read:packages</code> scope<br>
      Copy the generated token
    </td>
  </tr>
  <tr>
    <td><b>2. Configure npm Authentication</b></td>
    <td>
      <pre style="text-align: left;">
# Create .npmrc in project root or home directory
echo "@LLMTooling:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc</pre>
    </td>
  </tr>
  <tr>
    <td><b>3. Install the Package</b></td>
    <td>
      <pre style="text-align: left;">npm install @LLMTooling/code-search-mcp-universal-ctags</pre>
    </td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th>Alternative: Environment Variable Installation</th>
  </tr>
  <tr>
    <td>
      <pre style="text-align: left;">
echo "@LLMTooling:registry=https://npm.pkg.github.com" > .npmrc
export NODE_AUTH_TOKEN=YOUR_GITHUB_TOKEN
npm install @LLMTooling/code-search-mcp-universal-ctags</pre>
    </td>
  </tr>
</table>

</div>

<div align="center">

<h1>Usage</h1>

<table>
  <tr>
    <th>Usage Pattern</th>
    <th>Code Example</th>
  </tr>
  <tr>
    <td><b>Basic Usage</b></td>
    <td>
      <pre style="text-align: left;">
const { ctagsPath } = require('@LLMTooling/code-search-mcp-universal-ctags');

console.log('ctags binary location:', ctagsPath);
// Use ctagsPath with child_process to run ctags commands</pre>
    </td>
  </tr>
  <tr>
    <td><b>With execSync</b></td>
    <td>
      <pre style="text-align: left;">
const { execSync } = require('child_process');
const { ctagsPath } = require('@LLMTooling/code-search-mcp-universal-ctags');

// Get ctags version
const version = execSync(`"${ctagsPath}" --version`, { encoding: 'utf8' });
console.log(version);

// Generate tags for a project
execSync(`"${ctagsPath}" -R --fields=+nKz --extras=+q .`, {
  cwd: '/path/to/project'
});</pre>
    </td>
  </tr>
  <tr>
    <td><b>With spawn</b></td>
    <td>
      <pre style="text-align: left;">
const { spawn } = require('child_process');
const { ctagsPath } = require('@LLMTooling/code-search-mcp-universal-ctags');

const ctags = spawn(ctagsPath, ['--version']);

ctags.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ctags.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});</pre>
    </td>
  </tr>
</table>

</div>

<div align="center">

<h1>Platform Support</h1>

<table>
  <tr>
    <th>Platform</th>
    <th>Architecture</th>
    <th>Binary Source</th>
  </tr>
  <tr>
    <td>Windows</td>
    <td>x64, x86</td>
    <td><a href="https://github.com/universal-ctags/ctags-win32">ctags-win32</a></td>
  </tr>
  <tr>
    <td>macOS</td>
    <td>x64 (Intel), ARM64 (Apple Silicon)</td>
    <td><a href="https://github.com/universal-ctags/ctags-nightly-build">ctags-nightly-build</a></td>
  </tr>
  <tr>
    <td>Linux</td>
    <td>x64, ARM64</td>
    <td><a href="https://github.com/universal-ctags/ctags-nightly-build">ctags-nightly-build</a></td>
  </tr>
</table>

</div>

<div align="center">

<h1>Architecture</h1>

</div>

<div align="center">

<h2>Package Structure</h2>

<table>
  <tr>
    <th>File Tree</th>
  </tr>
  <tr>
    <td>
      <pre style="text-align: left;">
code-search-mcp-universal-ctags/
├── lib/
│   ├── index.js          # Main entry point
│   ├── postinstall.js    # Download and setup logic
│   └── util.js           # Helper functions
├── test/
│   └── basic.test.js     # Test suite
├── bin/                  # Created during install (git-ignored)
│   └── ctags(.exe)       # Platform-specific binary
└── package.json</pre>
    </td>
  </tr>
</table>

</div>

<div align="center">

<h2>How It Works</h2>

<table>
  <tr>
    <th>Phase</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><b>Installation</b></td>
    <td>npm install triggers the postinstall script</td>
  </tr>
  <tr>
    <td><b>Platform Detection</b></td>
    <td>Determines operating system and CPU architecture</td>
  </tr>
  <tr>
    <td><b>Download</b></td>
    <td>Fetches appropriate binary from GitHub releases</td>
  </tr>
  <tr>
    <td><b>Extraction</b></td>
    <td>Extracts binary to the bin/ directory</td>
  </tr>
  <tr>
    <td><b>Permissions</b></td>
    <td>Sets executable permissions on Unix systems</td>
  </tr>
  <tr>
    <td><b>Verification</b></td>
    <td>Main module verifies binary existence before exporting path</td>
  </tr>
</table>

</div>

<div align="center">

<h1>Configuration</h1>

</div>

<div align="center">

<h2>Environment Variables</h2>

<table>
  <tr>
    <th>Variable</th>
    <th>Purpose</th>
    <th>Default</th>
  </tr>
  <tr>
    <td><code>GITHUB_TOKEN</code></td>
    <td>GitHub API authentication to avoid rate limits</td>
    <td>None</td>
  </tr>
  <tr>
    <td><code>SKIP_POSTINSTALL</code></td>
    <td>Skip automatic binary download during installation</td>
    <td>false</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th>Example Usage</th>
  </tr>
  <tr>
    <td>
      <pre style="text-align: left;">
# Avoid GitHub API rate limits
export GITHUB_TOKEN=your_github_token
npm install

# Skip automatic binary download
SKIP_POSTINSTALL=1 npm install</pre>
    </td>
  </tr>
</table>

</div>

<div align="center">

<h1>Development</h1>

<table>
  <tr>
    <th>Setup & Testing</th>
  </tr>
  <tr>
    <td>
      <pre style="text-align: left;">
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
npm run lint:fix</pre>
    </td>
  </tr>
</table>

</div>

<div align="center">

<h2>Test Coverage</h2>

<p>Comprehensive tests verify binary download, extraction, executable permissions, functionality, and tag generation capabilities.</p>

<table>
  <tr>
    <th>CI/CD Workflows</th>
    <th>Purpose</th>
    <th>Platforms</th>
  </tr>
  <tr>
    <td>Platform Tests</td>
    <td>Automated testing on all supported platforms</td>
    <td>Windows, macOS (x64/ARM64), Linux</td>
  </tr>
  <tr>
    <td>Publish</td>
    <td>Publish package to GitHub Packages</td>
    <td>N/A</td>
  </tr>
</table>

</div>

<div align="center">

<h1>Troubleshooting</h1>

<table>
  <tr>
    <th>Issue</th>
    <th>Solution</th>
  </tr>
  <tr>
    <td><b>Binary Not Found</b></td>
    <td>
      Ensure postinstall script ran successfully<br>
      Verify bin/ directory exists<br>
      Try reinstalling: <code>rm -rf node_modules && npm install</code>
    </td>
  </tr>
  <tr>
    <td><b>Download Failures</b></td>
    <td>
      Check internet connection and GitHub accessibility<br>
      Use GITHUB_TOKEN to avoid rate limits<br>
      Consider manual installation
    </td>
  </tr>
  <tr>
    <td><b>Permission Errors (Unix)</b></td>
    <td>
      <code>chmod +x node_modules/@LLMTooling/code-search-mcp-universal-ctags/bin/ctags</code>
    </td>
  </tr>
</table>

</div>

<div align="center">

<h2>Manual Installation</h2>

<p>If automatic installation fails, install universal-ctags manually:</p>

<table>
  <tr>
    <th>Platform</th>
    <th>Installation Command</th>
  </tr>
  <tr>
    <td>macOS</td>
    <td><code>brew install universal-ctags</code></td>
  </tr>
  <tr>
    <td>Linux (Ubuntu/Debian)</td>
    <td><code>sudo apt install universal-ctags</code></td>
  </tr>
  <tr>
    <td>Linux (Snap)</td>
    <td><code>sudo snap install universal-ctags</code></td>
  </tr>
  <tr>
    <td>Windows</td>
    <td>Download from <a href="https://github.com/universal-ctags/ctags-win32/releases">ctags-win32 releases</a></td>
  </tr>
</table>

</div>

<div align="center">

<h1>Contributing & License</h1>

<table>
  <tr>
    <th>Contributing</th>
    <th>License</th>
  </tr>
  <tr>
    <td>
      Fork the repository<br>
      Create a feature branch<br>
      Make changes and add tests<br>
      Run tests and linting<br>
      Submit a pull request
    </td>
    <td>
      Released under the MIT License<br>
      See <a href="LICENSE">LICENSE</a> file for details
    </td>
  </tr>
</table>

</div>

<div align="center">

<h1>Acknowledgments</h1>

<table>
  <tr>
    <th>Project</th>
    <th>Contribution</th>
  </tr>
  <tr>
    <td><a href="https://github.com/universal-ctags/ctags">Universal Ctags</a></td>
    <td>Core ctags implementation</td>
  </tr>
  <tr>
    <td><a href="https://github.com/universal-ctags/ctags-win32">ctags-win32</a></td>
    <td>Windows binary distribution</td>
  </tr>
  <tr>
    <td><a href="https://github.com/universal-ctags/ctags-nightly-build">ctags-nightly-build</a></td>
    <td>Unix binary distribution</td>
  </tr>
  <tr>
    <td><a href="https://github.com/microsoft/vscode-ripgrep">vscode-ripgrep</a></td>
    <td>Package structure inspiration</td>
  </tr>
</table>

<br>

<p><b>Built for the Model Context Protocol ecosystem</b></p>

</div>
