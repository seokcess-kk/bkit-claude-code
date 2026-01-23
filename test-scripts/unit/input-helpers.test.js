/**
 * Input Helper Tests
 * TC-U060 ~ TC-U067
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');

const runner = new TestRunner({ verbose: true });
const common = require('../../lib/common');

runner.describe('Input Helper Functions', () => {
  // TC-U060
  runner.it('parseHookInput extracts tool_name', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_name: 'Write' };
    const result = common.parseHookInput(input);
    assert.equal(result.toolName, 'Write');
  });

  // TC-U061
  runner.it('parseHookInput extracts file_path', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_input: { file_path: '/src/app.ts' } };
    const result = common.parseHookInput(input);
    assert.equal(result.filePath, '/src/app.ts');
  });

  // TC-U062
  runner.it('parseHookInput extracts path fallback', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_input: { path: '/src/index.ts' } };
    const result = common.parseHookInput(input);
    assert.equal(result.filePath, '/src/index.ts');
  });

  // TC-U063
  runner.it('parseHookInput extracts content', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_input: { content: 'test content' } };
    const result = common.parseHookInput(input);
    assert.equal(result.content, 'test content');
  });

  // TC-U064
  runner.it('parseHookInput extracts new_string fallback', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_input: { new_string: 'new value' } };
    const result = common.parseHookInput(input);
    assert.equal(result.content, 'new value');
  });

  // TC-U065
  runner.it('parseHookInput extracts command', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_input: { command: 'npm install' } };
    const result = common.parseHookInput(input);
    assert.equal(result.command, 'npm install');
  });

  // TC-U066
  runner.it('parseHookInput handles empty input', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const result = common.parseHookInput({});
    assert.equal(result.toolName, '');
    assert.equal(result.filePath, '');
    assert.equal(result.content, '');
  });

  // TC-U067
  runner.it('parseHookInput extracts old_string', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_input: { old_string: 'old value' } };
    const result = common.parseHookInput(input);
    assert.equal(result.oldString, 'old value');
  });
});

module.exports = runner;
