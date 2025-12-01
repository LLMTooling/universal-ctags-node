<div align="center">

<h1>universal-ctags-node</h1>

<p><b>Node.js wrapper for universal-ctags binaries for cross-platform code indexing</b></p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg?style=for-the-badge)](package.json)
[![Platform Support](https://img.shields.io/badge/ctags-6.2.1-lightgrey.svg?style=for-the-badge)](#platform-support)

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
    <td>MCP Ready</td>
    <td>Purpose-built for Model Context Protocol servers requiring universal-ctags functionality.</td>
  </tr>
</table>

</div>

<div align="center">

<h1>Installation</h1>

</div>

<div align="center">

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
      <pre style="text-align: left;">npm install @LLMTooling/universal-ctags-node</pre>
    </td>
  </tr>
</table>

<br>
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
const { ctagsPath } = require('@LLMTooling/universal-ctags-node');

console.log('ctags binary location:', ctagsPath);
// Use ctagsPath with child_process to run ctags commands</pre>
    </td>
  </tr>
  <tr>
    <td><b>With execSync</b></td>
    <td>
      <pre style="text-align: left;">
const { execSync } = require('child_process');
const { ctagsPath } = require('@LLMTooling/universal-ctags-node');

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
const { ctagsPath } = require('@LLMTooling/universal-ctags-node');

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

<h1>Configuration</h1>

</div>

<div align="center">

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
