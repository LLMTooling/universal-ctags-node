/**
 * Basic test suite for universal-ctags package
 * Tests that the binary is installed and functional
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

/**
 * Assert helper
 */
function assert(condition, message) {
  testsRun++;
  if (condition) {
    testsPassed++;
    console.log(`${colors.green}✓${colors.reset} ${message}`);
  } else {
    testsFailed++;
    console.log(`${colors.red}✗${colors.reset} ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Test: Package exports ctagsPath
 */
function testExports() {
  console.log(`\n${colors.blue}Testing package exports...${colors.reset}`);

  const pkg = require('../lib/index.js');
  assert(pkg.ctagsPath !== undefined, 'Package should export ctagsPath');
  assert(typeof pkg.ctagsPath === 'string', 'ctagsPath should be a string');
  assert(pkg.ctagsPath.length > 0, 'ctagsPath should not be empty');

  console.log(`  Path: ${pkg.ctagsPath}`);
}

/**
 * Test: Binary file exists
 */
function testBinaryExists() {
  console.log(`\n${colors.blue}Testing binary existence...${colors.reset}`);

  const pkg = require('../lib/index.js');
  const binaryExists = fs.existsSync(pkg.ctagsPath);

  assert(binaryExists, `Binary should exist at ${pkg.ctagsPath}`);

  const stats = fs.statSync(pkg.ctagsPath);
  assert(stats.isFile(), 'Binary path should point to a file');

  // Check file size (should be at least 1MB for a real binary)
  const sizeMB = stats.size / (1024 * 1024);
  assert(sizeMB > 0.5, `Binary should be at least 0.5MB (actual: ${sizeMB.toFixed(2)}MB)`);

  console.log(`  Size: ${sizeMB.toFixed(2)}MB`);
}

/**
 * Test: Binary is executable (Unix only)
 */
function testBinaryExecutable() {
  if (process.platform === 'win32') {
    console.log(`\n${colors.yellow}Skipping executable test on Windows${colors.reset}`);
    return;
  }

  console.log(`\n${colors.blue}Testing binary permissions...${colors.reset}`);

  const pkg = require('../lib/index.js');
  const stats = fs.statSync(pkg.ctagsPath);
  const mode = stats.mode;

  // Check if executable bit is set (owner execute permission)
  const isExecutable = (mode & 0o100) !== 0;
  assert(isExecutable, 'Binary should have executable permissions');
}

/**
 * Test: Binary runs --version command
 */
function testBinaryVersion() {
  console.log(`\n${colors.blue}Testing binary functionality...${colors.reset}`);

  const pkg = require('../lib/index.js');

  try {
    const output = execSync(`"${pkg.ctagsPath}" --version`, {
      encoding: 'utf8',
      timeout: 10000
    });

    assert(output.length > 0, 'Binary should produce output');
    assert(
      output.toLowerCase().includes('universal ctags') ||
      output.toLowerCase().includes('universal-ctags'),
      'Output should mention Universal Ctags'
    );

    console.log(`  Version output (first line): ${output.split('\n')[0]}`);
  } catch (error) {
    throw new Error(`Failed to run binary: ${error.message}`);
  }
}

/**
 * Test: Binary can generate tags
 */
function testGenerateTags() {
  console.log(`\n${colors.blue}Testing tag generation...${colors.reset}`);

  const pkg = require('../lib/index.js');

  // Create a temporary test file
  const testDir = path.join(__dirname, '..', 'test-temp');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  const testFile = path.join(testDir, 'test.js');
  const testContent = `
function testFunction() {
  return 'test';
}

class TestClass {
  constructor() {
    this.value = 42;
  }
}
`;

  fs.writeFileSync(testFile, testContent);

  try {
    const tagsFile = path.join(testDir, 'tags');

    // Run ctags to generate tags
    execSync(`"${pkg.ctagsPath}" -f "${tagsFile}" "${testFile}"`, {
      encoding: 'utf8',
      timeout: 10000
    });

    assert(fs.existsSync(tagsFile), 'Tags file should be generated');

    const tagsContent = fs.readFileSync(tagsFile, 'utf8');
    assert(tagsContent.length > 0, 'Tags file should not be empty');
    assert(
      tagsContent.includes('testFunction') || tagsContent.includes('TestClass'),
      'Tags file should contain function/class names'
    );

    console.log(`  Tags generated successfully`);
  } finally {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  }
}

/**
 * Run all tests
 */
function runTests() {
  console.log(`${colors.blue}================================${colors.reset}`);
  console.log(`${colors.blue}Universal Ctags Test Suite${colors.reset}`);
  console.log(`${colors.blue}================================${colors.reset}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Node version: ${process.version}`);

  try {
    testExports();
    testBinaryExists();
    testBinaryExecutable();
    testBinaryVersion();
    testGenerateTags();

    console.log(`\n${colors.blue}================================${colors.reset}`);
    console.log(`${colors.green}All tests passed!${colors.reset}`);
    console.log(`Tests run: ${testsRun}`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    console.log(`${colors.blue}================================${colors.reset}\n`);

    process.exit(0);
  } catch (error) {
    console.log(`\n${colors.blue}================================${colors.reset}`);
    console.log(`${colors.red}Tests failed!${colors.reset}`);
    console.log(`Tests run: ${testsRun}`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    console.log(`${colors.blue}================================${colors.reset}\n`);
    console.error(`${colors.red}Error: ${error.message}${colors.reset}\n`);

    process.exit(1);
  }
}

// Run tests
runTests();
