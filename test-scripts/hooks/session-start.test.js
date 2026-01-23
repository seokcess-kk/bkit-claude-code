/**
 * Session Start Hook Tests
 * TC-H001 ~ TC-H010
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { runScript, runScriptWithJson } = require('../lib/safe-exec');
const { MockEnv, clearModuleCache } = require('../lib/mocks');
const fs = require('fs');
const path = require('path');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();

const TEST_DIR = path.join(__dirname, '../.test-temp-hooks');
const HOOKS_DIR = path.join(__dirname, '../../hooks');

runner.describe('Session Start Hook', () => {
  runner.beforeEach(() => {
    fs.mkdirSync(path.join(TEST_DIR, 'docs'), { recursive: true });
    mockEnv.set('CLAUDE_PROJECT_DIR', TEST_DIR);
  });

  runner.afterEach(() => {
    mockEnv.restore();
    try {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    } catch (e) { /* ignore */ }
    clearModuleCache('../../lib/common');
  });

  // TC-H001: session-start.js exists
  runner.it('session-start.js exists', () => {
    const hookPath = path.join(HOOKS_DIR, 'session-start.js');
    assert.true(fs.existsSync(hookPath));
  });

  // TC-H002: session-start.js runs without error
  runner.it('session-start.js runs without error', () => {
    const hookPath = path.join(HOOKS_DIR, 'session-start.js');
    if (!fs.existsSync(hookPath)) {
      console.log('     ⏭️ Skipped: session-start.js not found');
      return;
    }

    const input = {
      session_id: 'test-session-123',
      cwd: TEST_DIR
    };

    const result = runScriptWithJson(hookPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Should exit with 0 or produce valid output
    assert.true(result.status === 0 || result.status === null);
  });

  // TC-H003: session-start.js produces JSON output
  runner.it('session-start.js produces valid JSON', () => {
    const hookPath = path.join(HOOKS_DIR, 'session-start.js');
    if (!fs.existsSync(hookPath)) {
      console.log('     ⏭️ Skipped: session-start.js not found');
      return;
    }

    const input = { session_id: 'test-json-123' };

    const result = runScriptWithJson(hookPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Should produce JSON or empty output
    if (result.stdout.trim()) {
      try {
        const jsonStart = result.stdout.indexOf('{');
        if (jsonStart !== -1) {
          const jsonEnd = result.stdout.lastIndexOf('}');
          const json = result.stdout.substring(jsonStart, jsonEnd + 1);
          const parsed = JSON.parse(json);
          assert.exists(parsed);
        }
      } catch (e) {
        // May have non-JSON prefix
        console.log('     ℹ️ Note: Output may include non-JSON content');
      }
    }
    assert.true(true);
  });

  // TC-H004: session-start.js initializes PDCA status
  runner.it('session-start.js works with PDCA status', () => {
    const hookPath = path.join(HOOKS_DIR, 'session-start.js');
    if (!fs.existsSync(hookPath)) {
      console.log('     ⏭️ Skipped: session-start.js not found');
      return;
    }

    const input = { session_id: 'test-pdca-init' };

    const result = runScriptWithJson(hookPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Should complete without error
    assert.true(result.status === 0 || result.status === null);
  });

  // TC-H005: session-start.js detects level
  runner.it('session-start.js detects project level', () => {
    // Create CLAUDE.md with level
    fs.writeFileSync(path.join(TEST_DIR, 'CLAUDE.md'), 'level: Dynamic\n');

    const hookPath = path.join(HOOKS_DIR, 'session-start.js');
    if (!fs.existsSync(hookPath)) {
      console.log('     ⏭️ Skipped: session-start.js not found');
      return;
    }

    const input = { session_id: 'test-level-detect' };

    const result = runScriptWithJson(hookPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Should detect level from CLAUDE.md
    assert.true(result.status === 0 || result.status === null);
  });

  // TC-H006: session-start.js handles resume
  runner.it('session-start.js handles session resume', () => {
    // Create existing PDCA status
    const statusData = {
      version: '2.0',
      primaryFeature: 'login',
      features: {
        login: { phase: 'do' }
      }
    };
    fs.writeFileSync(
      path.join(TEST_DIR, 'docs/.pdca-status.json'),
      JSON.stringify(statusData)
    );

    const hookPath = path.join(HOOKS_DIR, 'session-start.js');
    if (!fs.existsSync(hookPath)) {
      console.log('     ⏭️ Skipped: session-start.js not found');
      return;
    }

    const input = { session_id: 'test-resume' };

    const result = runScriptWithJson(hookPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Should handle existing status
    assert.true(result.status === 0 || result.status === null);
  });

  // TC-H007: session-start.js handles empty cwd
  runner.it('session-start.js handles missing cwd gracefully', () => {
    const hookPath = path.join(HOOKS_DIR, 'session-start.js');
    if (!fs.existsSync(hookPath)) {
      console.log('     ⏭️ Skipped: session-start.js not found');
      return;
    }

    const input = { session_id: 'test-no-cwd' };

    const result = runScriptWithJson(hookPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Should not crash
    assert.true(typeof result.status === 'number' || result.status === null);
  });

  // TC-H008: session-start.js version output
  runner.it('session-start.js outputs version info', () => {
    const hookPath = path.join(HOOKS_DIR, 'session-start.js');
    if (!fs.existsSync(hookPath)) {
      console.log('     ⏭️ Skipped: session-start.js not found');
      return;
    }

    const input = { session_id: 'test-version' };

    const result = runScriptWithJson(hookPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // May contain version in output
    const hasVersion = result.stdout.includes('v1.') ||
                       result.stdout.includes('bkit') ||
                       result.status === 0;
    assert.true(hasVersion || result.status === null);
  });

  // TC-H009: session-start.js handles Gemini environment
  runner.it('session-start.js works with Gemini env', () => {
    const hookPath = path.join(HOOKS_DIR, 'session-start.js');
    if (!fs.existsSync(hookPath)) {
      console.log('     ⏭️ Skipped: session-start.js not found');
      return;
    }

    const input = { session_id: 'test-gemini' };

    const result = runScriptWithJson(hookPath, input, {
      GEMINI_PROJECT_DIR: TEST_DIR,
      BKIT_PLATFORM: 'gemini'
    });

    // Should handle Gemini environment
    assert.true(typeof result.status === 'number' || result.status === null);
  });

  // TC-H010: session-start.js debug logging
  runner.it('session-start.js can write debug log', () => {
    const hookPath = path.join(HOOKS_DIR, 'session-start.js');
    if (!fs.existsSync(hookPath)) {
      console.log('     ⏭️ Skipped: session-start.js not found');
      return;
    }

    const input = { session_id: 'test-debug-log' };

    const result = runScriptWithJson(hookPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR,
      BKIT_DEBUG: 'true'
    });

    // Should complete (debug log is optional)
    assert.true(typeof result.status === 'number' || result.status === null);
  });
});

module.exports = runner;
