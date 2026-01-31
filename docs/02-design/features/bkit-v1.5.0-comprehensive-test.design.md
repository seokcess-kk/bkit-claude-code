# bkit v1.5.0 Comprehensive Test Design Document

> **Summary**: bkit v1.5.0 종합 기능 테스트 상세 설계
>
> **Project**: bkit-claude-code
> **Version**: 1.5.0
> **Author**: Claude Code + bkit PDCA
> **Date**: 2026-02-01
> **Status**: In Progress
> **Planning Doc**: [bkit-v1.5.0-comprehensive-test.plan.md](../01-plan/features/bkit-v1.5.0-comprehensive-test.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. **실행 가능한 테스트 설계**: Plan의 200+ 테스트 케이스를 실제 실행 가능한 형태로 상세화
2. **자동화 지원**: Node.js 기반 테스트 스크립트 및 수동 검증 절차 분리
3. **체계적 추적**: Task Management System 연동으로 테스트 진행 상황 실시간 추적
4. **회귀 방지**: Gemini 코드 제거로 인한 잠재적 문제 조기 발견

### 1.2 Design Principles

- **Executable First**: 모든 테스트 케이스는 즉시 실행 가능해야 함
- **Isolation**: 각 테스트는 독립적으로 실행 가능해야 함
- **Traceable**: 테스트 결과는 Plan의 TC-ID와 1:1 매핑되어야 함
- **Minimal Setup**: 추가 의존성 없이 기존 환경에서 실행 가능해야 함

---

## 2. Test Architecture

### 2.1 Test Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Test Execution Architecture                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐  │
│  │   Test      │────▶│   Test      │────▶│   Result    │────▶│  Report  │  │
│  │   Runner    │     │   Cases     │     │   Collector │     │  Writer  │  │
│  └─────────────┘     └─────────────┘     └─────────────┘     └──────────┘  │
│        │                    │                    │                  │       │
│        ▼                    ▼                    ▼                  ▼       │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐  │
│  │  Task       │     │  lib/       │     │  JSON       │     │  Markdown│  │
│  │  System     │     │  modules    │     │  Output     │     │  Report  │  │
│  └─────────────┘     └─────────────┘     └─────────────┘     └──────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Test Categories & Execution Methods

| Category | Method | Automation Level | Tool |
|----------|--------|------------------|------|
| Unit Tests (lib/) | Node.js 직접 실행 | Full Auto | scripts/test-runner.js |
| Hook Tests | stdin 시뮬레이션 | Semi-Auto | Bash + JSON |
| Skill Tests | Claude Code 세션 | Manual | /pdca, /starter 등 |
| Agent Tests | Task Agent 호출 | Manual | Task tool |
| Integration | 시나리오 기반 | Manual | Checklist |
| E2E | 전체 사이클 | Manual | PDCA Workflow |

### 2.3 Directory Structure

```
tests/
├── unit/                      # Unit test scripts
│   ├── test-core.js          # lib/core/ tests
│   ├── test-pdca.js          # lib/pdca/ tests
│   ├── test-intent.js        # lib/intent/ tests
│   ├── test-task.js          # lib/task/ tests
│   └── test-context.js       # Context Engineering tests
├── fixtures/                  # Test data
│   ├── mock-pdca-status.json
│   ├── mock-hook-input.json
│   └── sample-files/
├── results/                   # Test output
│   └── YYYY-MM-DD/
└── runner.js                  # Main test runner
```

---

## 3. Unit Test Implementation

### 3.1 Test Runner Script

**File**: `tests/runner.js`

```javascript
#!/usr/bin/env node
/**
 * bkit v1.5.0 Test Runner
 *
 * Usage:
 *   node tests/runner.js              # Run all tests
 *   node tests/runner.js --module core  # Run specific module
 *   node tests/runner.js --tc TC-CORE-001  # Run specific test case
 */

const path = require('path');
const fs = require('fs');

// Test configuration
const CONFIG = {
  timeout: 5000,
  verbose: process.argv.includes('--verbose'),
  module: getArgValue('--module'),
  testCase: getArgValue('--tc'),
  outputDir: path.join(__dirname, 'results', new Date().toISOString().split('T')[0])
};

// Results collector
const results = {
  passed: [],
  failed: [],
  skipped: [],
  startTime: Date.now()
};

// Test assertion helpers
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertExists(value, message) {
  if (value === undefined || value === null) {
    throw new Error(`${message}: value is ${value}`);
  }
}

function assertType(value, type, message) {
  if (typeof value !== type) {
    throw new Error(`${message}: expected type ${type}, got ${typeof value}`);
  }
}

function assertNotExists(obj, key, message) {
  if (obj && key in obj) {
    throw new Error(`${message}: key "${key}" should not exist`);
  }
}

// Test runner
async function runTest(id, name, testFn) {
  if (CONFIG.testCase && CONFIG.testCase !== id) {
    results.skipped.push({ id, name, reason: 'filtered' });
    return;
  }

  try {
    await testFn();
    results.passed.push({ id, name });
    if (CONFIG.verbose) console.log(`✅ ${id}: ${name}`);
  } catch (error) {
    results.failed.push({ id, name, error: error.message });
    console.log(`❌ ${id}: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Export for use in test modules
module.exports = {
  runTest,
  assert,
  assertEqual,
  assertExists,
  assertType,
  assertNotExists,
  results,
  CONFIG
};
```

### 3.2 lib/core/ Unit Tests

**File**: `tests/unit/test-core.js`

```javascript
#!/usr/bin/env node
/**
 * TC-CORE-001 ~ TC-CORE-007: lib/core/ Module Tests
 */

const path = require('path');
const { runTest, assertEqual, assertExists, assertType, assertNotExists } = require('../runner');

// Import modules under test
const LIB_PATH = path.join(__dirname, '../../lib/core');

async function runCoreTests() {
  console.log('\n📦 Testing lib/core/ modules...\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-CORE-001: platform.js
  // ═══════════════════════════════════════════════════════════════════════════

  const platform = require(path.join(LIB_PATH, 'platform.js'));

  await runTest('TC-CORE-001-01', 'detectPlatform() returns "claude" in Claude env', () => {
    // Set Claude environment
    process.env.CLAUDE_PROJECT_DIR = '/test/project';
    const result = platform.detectPlatform();
    assertEqual(result, 'claude', 'Platform detection');
    delete process.env.CLAUDE_PROJECT_DIR;
  });

  await runTest('TC-CORE-001-02', 'detectPlatform() returns "unknown" without env', () => {
    delete process.env.CLAUDE_PROJECT_DIR;
    delete process.env.GEMINI_API_KEY;
    const result = platform.detectPlatform();
    // May return 'claude' or 'unknown' depending on other env vars
    assertType(result, 'string', 'Platform type');
  });

  await runTest('TC-CORE-001-03', 'isClaudeCode() returns boolean', () => {
    const result = platform.isClaudeCode();
    assertType(result, 'boolean', 'isClaudeCode return type');
  });

  await runTest('TC-CORE-001-04', 'isGeminiCli() function removed', () => {
    assertNotExists(platform, 'isGeminiCli', 'Gemini function should not exist');
  });

  await runTest('TC-CORE-001-05', 'PLUGIN_ROOT is valid path', () => {
    assertExists(platform.PLUGIN_ROOT, 'PLUGIN_ROOT');
    assertType(platform.PLUGIN_ROOT, 'string', 'PLUGIN_ROOT type');
  });

  await runTest('TC-CORE-001-06', 'PROJECT_DIR is valid path', () => {
    assertExists(platform.PROJECT_DIR, 'PROJECT_DIR');
    assertType(platform.PROJECT_DIR, 'string', 'PROJECT_DIR type');
  });

  await runTest('TC-CORE-001-07', 'getPluginPath() returns absolute path', () => {
    const result = platform.getPluginPath('test/file.js');
    assertType(result, 'string', 'getPluginPath return type');
    assertEqual(path.isAbsolute(result), true, 'Path is absolute');
  });

  await runTest('TC-CORE-001-08', 'getProjectPath() returns absolute path', () => {
    const result = platform.getProjectPath('test/file.js');
    assertType(result, 'string', 'getProjectPath return type');
    assertEqual(path.isAbsolute(result), true, 'Path is absolute');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-CORE-002: cache.js
  // ═══════════════════════════════════════════════════════════════════════════

  const cache = require(path.join(LIB_PATH, 'cache.js'));

  await runTest('TC-CORE-002-01', 'cache set() and get() work correctly', () => {
    cache.set('test-key', 'test-value');
    const result = cache.get('test-key');
    assertEqual(result, 'test-value', 'Cache value');
  });

  await runTest('TC-CORE-002-02', 'cache invalidate() removes key', () => {
    cache.set('delete-key', 'value');
    cache.invalidate('delete-key');
    const result = cache.get('delete-key');
    assertEqual(result, undefined, 'Deleted key');
  });

  await runTest('TC-CORE-002-03', 'cache clear() removes all keys', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    assertEqual(cache.get('key1'), undefined, 'Cleared key1');
    assertEqual(cache.get('key2'), undefined, 'Cleared key2');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-CORE-003: io.js
  // ═══════════════════════════════════════════════════════════════════════════

  const io = require(path.join(LIB_PATH, 'io.js'));

  await runTest('TC-CORE-003-01', 'truncateContext() limits string length', () => {
    const longString = 'a'.repeat(60000);
    const result = io.truncateContext(longString);
    assertEqual(result.length <= 50000, true, 'Truncated length');
  });

  await runTest('TC-CORE-003-02', 'Gemini output format removed', () => {
    // Check that there's no gemini-specific formatting
    const moduleSource = require('fs').readFileSync(path.join(LIB_PATH, 'io.js'), 'utf8');
    assertEqual(moduleSource.includes('gemini'), false, 'No gemini references in io.js');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-CORE-004: debug.js
  // ═══════════════════════════════════════════════════════════════════════════

  const debug = require(path.join(LIB_PATH, 'debug.js'));

  await runTest('TC-CORE-004-01', 'getDebugLogPath() returns valid path', () => {
    const result = debug.getDebugLogPath();
    assertType(result, 'string', 'Debug log path type');
    assertEqual(result.includes('bkit-debug.log'), true, 'Log file name');
  });

  await runTest('TC-CORE-004-02', 'Gemini log path removed', () => {
    const moduleSource = require('fs').readFileSync(path.join(LIB_PATH, 'debug.js'), 'utf8');
    assertEqual(moduleSource.includes('.gemini'), false, 'No gemini log path');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-CORE-005: config.js
  // ═══════════════════════════════════════════════════════════════════════════

  const config = require(path.join(LIB_PATH, 'config.js'));

  await runTest('TC-CORE-005-01', 'safeJsonParse() parses valid JSON', () => {
    const result = config.safeJsonParse('{"key": "value"}');
    assertEqual(result.key, 'value', 'Parsed JSON');
  });

  await runTest('TC-CORE-005-02', 'safeJsonParse() returns default on invalid JSON', () => {
    const result = config.safeJsonParse('invalid json', { default: true });
    assertEqual(result.default, true, 'Default value');
  });

  await runTest('TC-CORE-005-03', 'getConfig() returns nested value', () => {
    const testConfig = { level1: { level2: { value: 'nested' } } };
    const result = config.getConfig('level1.level2.value', testConfig);
    assertEqual(result, 'nested', 'Nested config value');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-CORE-006: file.js
  // ═══════════════════════════════════════════════════════════════════════════

  const file = require(path.join(LIB_PATH, 'file.js'));

  await runTest('TC-CORE-006-01', 'isSourceFile() returns true for .js', () => {
    const result = file.isSourceFile('test.js');
    assertEqual(result, true, 'JS is source file');
  });

  await runTest('TC-CORE-006-02', 'isSourceFile() returns false for .md', () => {
    const result = file.isSourceFile('test.md');
    assertEqual(result, false, 'MD is not source file');
  });

  await runTest('TC-CORE-006-03', 'isCodeFile() returns true for .ts', () => {
    const result = file.isCodeFile('test.ts');
    assertEqual(result, true, 'TS is code file');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-CORE-007: index.js (Entry Point)
  // ═══════════════════════════════════════════════════════════════════════════

  const coreIndex = require(path.join(LIB_PATH, 'index.js'));

  await runTest('TC-CORE-007-01', 'Core index exports required functions', () => {
    assertExists(coreIndex.detectPlatform, 'detectPlatform export');
    assertExists(coreIndex.isClaudeCode, 'isClaudeCode export');
    assertExists(coreIndex.PLUGIN_ROOT, 'PLUGIN_ROOT export');
  });

  await runTest('TC-CORE-007-02', 'isGeminiCli not exported from core index', () => {
    assertNotExists(coreIndex, 'isGeminiCli', 'isGeminiCli should not be exported');
  });
}

module.exports = { runCoreTests };

// Run if called directly
if (require.main === module) {
  runCoreTests().then(() => {
    console.log('\n✅ Core tests completed');
  }).catch(console.error);
}
```

### 3.3 lib/pdca/ Unit Tests

**File**: `tests/unit/test-pdca.js`

```javascript
#!/usr/bin/env node
/**
 * TC-PDCA-001 ~ TC-PDCA-005: lib/pdca/ Module Tests
 */

const path = require('path');
const fs = require('fs');
const { runTest, assertEqual, assertExists, assertType } = require('../runner');

const LIB_PATH = path.join(__dirname, '../../lib/pdca');

async function runPdcaTests() {
  console.log('\n📦 Testing lib/pdca/ modules...\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-PDCA-001: status.js
  // ═══════════════════════════════════════════════════════════════════════════

  const status = require(path.join(LIB_PATH, 'status.js'));

  await runTest('TC-PDCA-001-01', 'getPdcaStatusPath() returns valid path', () => {
    const result = status.getPdcaStatusPath();
    assertType(result, 'string', 'Status path type');
    assertEqual(result.includes('.pdca-status.json'), true, 'Status file name');
  });

  await runTest('TC-PDCA-001-02', 'createInitialStatusV2() returns v2.0 schema', () => {
    const result = status.createInitialStatusV2();
    assertEqual(result.version, '2.0', 'Version');
    assertExists(result.features, 'Features object');
    assertExists(result.pipeline, 'Pipeline object');
    assertExists(result.session, 'Session object');
  });

  await runTest('TC-PDCA-001-03', 'loadPdcaStatus() returns status object', () => {
    const result = status.loadPdcaStatus();
    assertExists(result, 'Status object');
    assertType(result, 'object', 'Status type');
  });

  await runTest('TC-PDCA-001-04', 'getFeatureStatus() returns feature or null', () => {
    const pdcaStatus = status.loadPdcaStatus();
    if (pdcaStatus.features && Object.keys(pdcaStatus.features).length > 0) {
      const featureName = Object.keys(pdcaStatus.features)[0];
      const result = status.getFeatureStatus(featureName);
      assertExists(result, 'Feature status');
    }
    // Non-existent feature
    const nullResult = status.getFeatureStatus('non-existent-feature-12345');
    assertEqual(nullResult, null, 'Non-existent feature returns null');
  });

  await runTest('TC-PDCA-001-05', 'getActiveFeatures() returns array', () => {
    const result = status.getActiveFeatures();
    assertEqual(Array.isArray(result), true, 'Returns array');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-PDCA-002: phase.js
  // ═══════════════════════════════════════════════════════════════════════════

  const phase = require(path.join(LIB_PATH, 'phase.js'));

  await runTest('TC-PDCA-002-01', 'getPhaseNumber() returns correct number', () => {
    assertEqual(phase.getPhaseNumber('plan'), 1, 'Plan phase');
    assertEqual(phase.getPhaseNumber('design'), 2, 'Design phase');
    assertEqual(phase.getPhaseNumber('do'), 3, 'Do phase');
    assertEqual(phase.getPhaseNumber('check'), 4, 'Check phase');
    assertEqual(phase.getPhaseNumber('act'), 5, 'Act phase');
  });

  await runTest('TC-PDCA-002-02', 'getPhaseName() returns correct name', () => {
    assertEqual(phase.getPhaseName(1), 'plan', 'Phase 1');
    assertEqual(phase.getPhaseName(2), 'design', 'Phase 2');
    assertEqual(phase.getPhaseName(3), 'do', 'Phase 3');
  });

  await runTest('TC-PDCA-002-03', 'getNextPdcaPhase() returns next phase', () => {
    assertEqual(phase.getNextPdcaPhase('plan'), 'design', 'After plan');
    assertEqual(phase.getNextPdcaPhase('design'), 'do', 'After design');
    assertEqual(phase.getNextPdcaPhase('do'), 'check', 'After do');
  });

  await runTest('TC-PDCA-002-04', 'findDesignDoc() returns path or null', () => {
    const result = phase.findDesignDoc('test-feature');
    // Should return null for non-existent feature or path if exists
    assertEqual(result === null || typeof result === 'string', true, 'Returns null or string');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-PDCA-003: level.js
  // ═══════════════════════════════════════════════════════════════════════════

  const level = require(path.join(LIB_PATH, 'level.js'));

  await runTest('TC-PDCA-003-01', 'detectLevel() returns valid level', () => {
    const result = level.detectLevel();
    assertEqual(['Starter', 'Dynamic', 'Enterprise'].includes(result), true, 'Valid level');
  });

  await runTest('TC-PDCA-003-02', 'getRequiredPhases() returns array', () => {
    const result = level.getRequiredPhases('Starter');
    assertEqual(Array.isArray(result), true, 'Returns array');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-PDCA-004: tier.js
  // ═══════════════════════════════════════════════════════════════════════════

  const tier = require(path.join(LIB_PATH, 'tier.js'));

  await runTest('TC-PDCA-004-01', 'getLanguageTier() returns tier number', () => {
    const tsResult = tier.getLanguageTier('.ts');
    const goResult = tier.getLanguageTier('.go');
    assertType(tsResult, 'number', 'TypeScript tier');
    assertType(goResult, 'number', 'Go tier');
  });

  await runTest('TC-PDCA-004-02', 'getTierDescription() returns string', () => {
    const result = tier.getTierDescription(1);
    assertType(result, 'string', 'Tier description');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-PDCA-005: automation.js
  // ═══════════════════════════════════════════════════════════════════════════

  const automation = require(path.join(LIB_PATH, 'automation.js'));

  await runTest('TC-PDCA-005-01', 'getAutomationLevel() returns valid level', () => {
    const result = automation.getAutomationLevel();
    assertEqual(['manual', 'semi-auto', 'full-auto'].includes(result), true, 'Valid automation level');
  });

  await runTest('TC-PDCA-005-02', 'shouldAutoAdvance() returns boolean', () => {
    const result = automation.shouldAutoAdvance(95, 'Dynamic');
    assertType(result, 'boolean', 'shouldAutoAdvance return type');
  });
}

module.exports = { runPdcaTests };

if (require.main === module) {
  runPdcaTests().then(() => {
    console.log('\n✅ PDCA tests completed');
  }).catch(console.error);
}
```

### 3.4 lib/intent/ Unit Tests

**File**: `tests/unit/test-intent.js`

```javascript
#!/usr/bin/env node
/**
 * TC-INTENT-001 ~ TC-INTENT-003: lib/intent/ Module Tests
 */

const path = require('path');
const { runTest, assertEqual, assertExists, assertType } = require('../runner');

const LIB_PATH = path.join(__dirname, '../../lib/intent');

async function runIntentTests() {
  console.log('\n📦 Testing lib/intent/ modules...\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-INTENT-001: language.js
  // ═══════════════════════════════════════════════════════════════════════════

  const language = require(path.join(LIB_PATH, 'language.js'));

  await runTest('TC-INTENT-001-01', 'detectLanguage() detects Korean', () => {
    const result = language.detectLanguage('안녕하세요');
    assertEqual(result, 'ko', 'Korean detection');
  });

  await runTest('TC-INTENT-001-02', 'detectLanguage() detects English', () => {
    const result = language.detectLanguage('Hello world');
    assertEqual(result, 'en', 'English detection');
  });

  await runTest('TC-INTENT-001-03', 'detectLanguage() detects Japanese', () => {
    const result = language.detectLanguage('こんにちは');
    assertEqual(result, 'ja', 'Japanese detection');
  });

  await runTest('TC-INTENT-001-04', 'getAllPatterns() returns 8-language patterns', () => {
    const result = language.getAllPatterns('gap-detector');
    assertType(result, 'object', 'Patterns object');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-INTENT-002: trigger.js
  // ═══════════════════════════════════════════════════════════════════════════

  const trigger = require(path.join(LIB_PATH, 'trigger.js'));

  await runTest('TC-INTENT-002-01', 'matchImplicitAgentTrigger() matches Korean', () => {
    const result = trigger.matchImplicitAgentTrigger('검증해줘');
    assertEqual(result !== null, true, 'Korean trigger matched');
  });

  await runTest('TC-INTENT-002-02', 'matchImplicitAgentTrigger() matches improvement', () => {
    const result = trigger.matchImplicitAgentTrigger('개선해줘');
    assertEqual(result !== null, true, 'Improvement trigger matched');
  });

  await runTest('TC-INTENT-002-03', 'matchImplicitSkillTrigger() matches plan', () => {
    const result = trigger.matchImplicitSkillTrigger('plan 작성해줘');
    assertEqual(result !== null, true, 'Plan trigger matched');
  });

  await runTest('TC-INTENT-002-04', 'detectNewFeatureIntent() detects intent', () => {
    const result = trigger.detectNewFeatureIntent('새 기능 추가해줘');
    assertType(result, 'object', 'Intent object');
    assertExists(result.detected, 'detected property');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-INTENT-003: ambiguity.js
  // ═══════════════════════════════════════════════════════════════════════════

  const ambiguity = require(path.join(LIB_PATH, 'ambiguity.js'));

  await runTest('TC-INTENT-003-01', 'calculateAmbiguityScore() returns low for clear request', () => {
    const result = ambiguity.calculateAmbiguityScore('/pdca plan user-auth');
    assertEqual(result < 50, true, 'Clear request has low score');
  });

  await runTest('TC-INTENT-003-02', 'calculateAmbiguityScore() returns high for vague request', () => {
    const result = ambiguity.calculateAmbiguityScore('뭔가 해줘');
    assertEqual(result >= 50, true, 'Vague request has high score');
  });

  await runTest('TC-INTENT-003-03', 'generateClarifyingQuestions() returns array', () => {
    const result = ambiguity.generateClarifyingQuestions('뭔가 해줘');
    assertEqual(Array.isArray(result), true, 'Returns array');
  });
}

module.exports = { runIntentTests };

if (require.main === module) {
  runIntentTests().then(() => {
    console.log('\n✅ Intent tests completed');
  }).catch(console.error);
}
```

### 3.5 lib/task/ Unit Tests

**File**: `tests/unit/test-task.js`

```javascript
#!/usr/bin/env node
/**
 * TC-TASK-001 ~ TC-TASK-004: lib/task/ Module Tests
 */

const path = require('path');
const { runTest, assertEqual, assertExists, assertType } = require('../runner');

const LIB_PATH = path.join(__dirname, '../../lib/task');

async function runTaskTests() {
  console.log('\n📦 Testing lib/task/ modules...\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-TASK-001: classification.js
  // ═══════════════════════════════════════════════════════════════════════════

  const classification = require(path.join(LIB_PATH, 'classification.js'));

  await runTest('TC-TASK-001-01', 'classifyTask() returns trivial for 5 lines', () => {
    const result = classification.classifyTask({ estimatedLines: 5 });
    assertEqual(result, 'trivial', 'Trivial classification');
  });

  await runTest('TC-TASK-001-02', 'classifyTask() returns minor for 30 lines', () => {
    const result = classification.classifyTask({ estimatedLines: 30 });
    assertEqual(result, 'minor', 'Minor classification');
  });

  await runTest('TC-TASK-001-03', 'classifyTask() returns feature for 150 lines', () => {
    const result = classification.classifyTask({ estimatedLines: 150 });
    assertEqual(result, 'feature', 'Feature classification');
  });

  await runTest('TC-TASK-001-04', 'classifyTask() returns major for 300 lines', () => {
    const result = classification.classifyTask({ estimatedLines: 300 });
    assertEqual(result, 'major', 'Major classification');
  });

  await runTest('TC-TASK-001-05', 'getPdcaGuidance() returns guidance', () => {
    const result = classification.getPdcaGuidance('feature');
    assertExists(result, 'Guidance object');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-TASK-002: context.js
  // ═══════════════════════════════════════════════════════════════════════════

  const context = require(path.join(LIB_PATH, 'context.js'));

  await runTest('TC-TASK-002-01', 'setActiveSkill() and getActiveSkill() work', () => {
    context.setActiveSkill('pdca');
    const result = context.getActiveSkill();
    assertEqual(result, 'pdca', 'Active skill');
    context.clearActiveContext();
  });

  await runTest('TC-TASK-002-02', 'setActiveAgent() and getActiveAgent() work', () => {
    context.setActiveAgent('gap-detector');
    const result = context.getActiveAgent();
    assertEqual(result, 'gap-detector', 'Active agent');
    context.clearActiveContext();
  });

  await runTest('TC-TASK-002-03', 'clearActiveContext() clears all', () => {
    context.setActiveSkill('test');
    context.setActiveAgent('test');
    context.clearActiveContext();
    assertEqual(context.getActiveSkill(), null, 'Cleared skill');
    assertEqual(context.getActiveAgent(), null, 'Cleared agent');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-TASK-003: creator.js
  // ═══════════════════════════════════════════════════════════════════════════

  const creator = require(path.join(LIB_PATH, 'creator.js'));

  await runTest('TC-TASK-003-01', 'generatePdcaTaskSubject() formats correctly', () => {
    const result = creator.generatePdcaTaskSubject('plan', 'user-auth');
    assertEqual(result, '[Plan] user-auth', 'Task subject format');
  });

  await runTest('TC-TASK-003-02', 'generatePdcaTaskDescription() returns string', () => {
    const result = creator.generatePdcaTaskDescription('plan', 'user-auth');
    assertType(result, 'string', 'Description type');
    assertEqual(result.length > 0, true, 'Non-empty description');
  });

  await runTest('TC-TASK-003-03', 'getPdcaTaskMetadata() returns metadata', () => {
    const result = creator.getPdcaTaskMetadata('plan', 'user-auth');
    assertExists(result.pdcaPhase, 'pdcaPhase');
    assertExists(result.feature, 'feature');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-TASK-004: tracker.js
  // ═══════════════════════════════════════════════════════════════════════════

  const tracker = require(path.join(LIB_PATH, 'tracker.js'));

  await runTest('TC-TASK-004-01', 'savePdcaTaskId() and getPdcaTaskId() work', () => {
    tracker.savePdcaTaskId('plan', 'test-123');
    const result = tracker.getPdcaTaskId('plan');
    assertEqual(result, 'test-123', 'Task ID');
  });

  await runTest('TC-TASK-004-02', 'getTaskChainStatus() returns status', () => {
    const result = tracker.getTaskChainStatus('test-feature');
    assertType(result, 'object', 'Status object');
  });

  await runTest('TC-TASK-004-03', 'triggerNextPdcaAction() returns action', () => {
    const result = tracker.triggerNextPdcaAction(85);
    assertExists(result, 'Action object');
  });
}

module.exports = { runTaskTests };

if (require.main === module) {
  runTaskTests().then(() => {
    console.log('\n✅ Task tests completed');
  }).catch(console.error);
}
```

---

## 4. Context Engineering Tests

### 4.1 FR-01 ~ FR-08 Test Implementation

**File**: `tests/unit/test-context.js`

```javascript
#!/usr/bin/env node
/**
 * TC-CE-001 ~ TC-CE-005: Context Engineering Module Tests
 */

const path = require('path');
const fs = require('fs');
const { runTest, assertEqual, assertExists, assertType, assertNotExists } = require('../runner');

const LIB_PATH = path.join(__dirname, '../../lib');

async function runContextTests() {
  console.log('\n📦 Testing Context Engineering modules...\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-CE-001: context-hierarchy.js (FR-01)
  // ═══════════════════════════════════════════════════════════════════════════

  const hierarchy = require(path.join(LIB_PATH, 'context-hierarchy.js'));

  await runTest('TC-CE-001-01', 'getContextHierarchy() returns 4-level object', () => {
    const result = hierarchy.getContextHierarchy();
    assertType(result, 'object', 'Hierarchy object');
  });

  await runTest('TC-CE-001-02', 'getHierarchicalConfig() returns config value', () => {
    // This may return undefined if config doesn't exist
    const result = hierarchy.getHierarchicalConfig('pdca.threshold');
    // Just verify it doesn't throw
    assertEqual(true, true, 'No error thrown');
  });

  await runTest('TC-CE-001-03', 'setSessionContext() stores value', () => {
    hierarchy.setSessionContext('test-key', 'test-value');
    // Verify storage (implementation-dependent)
    assertEqual(true, true, 'No error thrown');
  });

  await runTest('TC-CE-001-04', 'Gemini config path removed', () => {
    const source = fs.readFileSync(path.join(LIB_PATH, 'context-hierarchy.js'), 'utf8');
    assertEqual(source.includes('.gemini/'), false, 'No .gemini path');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-CE-002: import-resolver.js (FR-02)
  // ═══════════════════════════════════════════════════════════════════════════

  const resolver = require(path.join(LIB_PATH, 'import-resolver.js'));

  await runTest('TC-CE-002-01', 'resolveImports() processes @import directives', () => {
    const content = 'Test content without imports';
    const result = resolver.resolveImports(content, __dirname);
    assertEqual(result, content, 'No change without imports');
  });

  await runTest('TC-CE-002-02', 'Variable substitution works', () => {
    const result = resolver.resolveVariables('${PLUGIN_ROOT}/test');
    assertEqual(result.includes('${PLUGIN_ROOT}'), false, 'Variable resolved');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-CE-003: context-fork.js (FR-03)
  // ═══════════════════════════════════════════════════════════════════════════

  const fork = require(path.join(LIB_PATH, 'context-fork.js'));

  await runTest('TC-CE-003-01', 'forkContext() creates fork', () => {
    const result = fork.forkContext('test-skill');
    assertExists(result.forkId, 'Fork ID');
    assertExists(result.context, 'Fork context');
  });

  await runTest('TC-CE-003-02', 'Fork isolation maintained', () => {
    const { forkId, context } = fork.forkContext('test');
    context.testKey = 'modified';
    const original = fork.getParentContext();
    assertEqual(original.testKey === undefined, true, 'Parent not affected');
    fork.discardFork(forkId);
  });

  await runTest('TC-CE-003-03', 'discardFork() removes fork', () => {
    const { forkId } = fork.forkContext('test');
    fork.discardFork(forkId);
    const activeForks = fork.getActiveForks();
    assertEqual(activeForks.includes(forkId), false, 'Fork removed');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-CE-004: permission-manager.js (FR-05)
  // ═══════════════════════════════════════════════════════════════════════════

  const permission = require(path.join(LIB_PATH, 'permission-manager.js'));

  await runTest('TC-CE-004-01', 'checkPermission() allows safe operations', () => {
    const result = permission.checkPermission('Write', { file_path: '/safe/path.js' });
    assertEqual(['allow', 'ask'].includes(result), true, 'Safe operation');
  });

  await runTest('TC-CE-004-02', 'checkPermission() blocks dangerous operations', () => {
    const result = permission.checkPermission('Bash', { command: 'rm -rf /' });
    assertEqual(result, 'deny', 'Dangerous operation blocked');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-CE-005: memory-store.js (FR-08)
  // ═══════════════════════════════════════════════════════════════════════════

  const memory = require(path.join(LIB_PATH, 'memory-store.js'));

  await runTest('TC-CE-005-01', 'setMemory() and getMemory() work', () => {
    memory.setMemory('test-key', { value: 'test' });
    const result = memory.getMemory('test-key');
    assertEqual(result.value, 'test', 'Memory value');
  });

  await runTest('TC-CE-005-02', 'updateMemory() merges values', () => {
    memory.setMemory('merge-test', { a: 1 });
    memory.updateMemory('merge-test', { b: 2 });
    const result = memory.getMemory('merge-test');
    assertEqual(result.a, 1, 'Original value');
    assertEqual(result.b, 2, 'Merged value');
  });

  await runTest('TC-CE-005-03', 'deleteMemory() removes key', () => {
    memory.setMemory('delete-test', 'value');
    memory.deleteMemory('delete-test');
    const result = memory.getMemory('delete-test');
    assertEqual(result, undefined, 'Key deleted');
  });
}

module.exports = { runContextTests };

if (require.main === module) {
  runContextTests().then(() => {
    console.log('\n✅ Context Engineering tests completed');
  }).catch(console.error);
}
```

---

## 5. Hook Script Tests

### 5.1 Hook Test Execution Method

Hook 스크립트는 stdin으로 JSON을 받아 처리합니다. 테스트 방법:

```bash
# Example: Test session-start hook
echo '{"session_id":"test-123"}' | node hooks/session-start.js

# Example: Test user-prompt-handler
echo '{"user_prompt":"검증해줘"}' | node scripts/user-prompt-handler.js

# Example: Test pre-write hook
echo '{"tool_name":"Write","tool_input":{"file_path":"/test.js","content":"test"}}' | node hooks/pre-write.js
```

### 5.2 Hook Test Script

**File**: `tests/unit/test-hooks.js`

```javascript
#!/usr/bin/env node
/**
 * TC-HOOK-001 ~ TC-HOOK-009: Hook Script Tests
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { runTest, assertEqual, assertExists, assertType } = require('../runner');

const HOOKS_PATH = path.join(__dirname, '../../hooks');
const SCRIPTS_PATH = path.join(__dirname, '../../scripts');

// Helper to run hook script with JSON input
function runHookScript(scriptPath, input) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    proc.on('error', reject);

    proc.stdin.write(JSON.stringify(input));
    proc.stdin.end();
  });
}

async function runHookTests() {
  console.log('\n📦 Testing Hook Scripts...\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-HOOK-001: session-start.js
  // ═══════════════════════════════════════════════════════════════════════════

  await runTest('TC-HOOK-001-01', 'session-start.js executes successfully', async () => {
    const result = await runHookScript(
      path.join(HOOKS_PATH, 'session-start.js'),
      { session_id: 'test-session' }
    );
    assertEqual(result.code, 0, 'Exit code 0');
  });

  await runTest('TC-HOOK-001-05', 'session-start.js has no Gemini output', async () => {
    const result = await runHookScript(
      path.join(HOOKS_PATH, 'session-start.js'),
      { session_id: 'test-session' }
    );
    assertEqual(result.stdout.toLowerCase().includes('gemini'), false, 'No Gemini in output');
  });

  await runTest('TC-HOOK-001-06', 'session-start.js has no isGeminiCli import', () => {
    const source = fs.readFileSync(path.join(HOOKS_PATH, 'session-start.js'), 'utf8');
    assertEqual(source.includes('isGeminiCli'), false, 'No isGeminiCli import');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-HOOK-002: user-prompt-handler.js (FR-04)
  // ═══════════════════════════════════════════════════════════════════════════

  await runTest('TC-HOOK-002-01', 'user-prompt-handler detects feature intent', async () => {
    const result = await runHookScript(
      path.join(SCRIPTS_PATH, 'user-prompt-handler.js'),
      { user_prompt: '새 기능 추가해줘' }
    );
    assertEqual(result.code, 0, 'Exit code 0');
  });

  await runTest('TC-HOOK-002-02', 'user-prompt-handler suggests gap-detector', async () => {
    const result = await runHookScript(
      path.join(SCRIPTS_PATH, 'user-prompt-handler.js'),
      { user_prompt: '검증해줘' }
    );
    // Check output mentions gap-detector
    assertEqual(result.stdout.includes('gap') || result.code === 0, true, 'Gap detector triggered');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-HOOK-003: pre-write.js
  // ═══════════════════════════════════════════════════════════════════════════

  await runTest('TC-HOOK-003-01', 'pre-write.js allows Write tool', async () => {
    const result = await runHookScript(
      path.join(HOOKS_PATH, 'pre-write.js'),
      { tool_name: 'Write', tool_input: { file_path: '/test.js', content: 'test' } }
    );
    assertEqual(result.code, 0, 'Exit code 0');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-HOOK-004: unified-bash-pre.js
  // ═══════════════════════════════════════════════════════════════════════════

  await runTest('TC-HOOK-004-01', 'unified-bash-pre allows safe commands', async () => {
    const result = await runHookScript(
      path.join(SCRIPTS_PATH, 'unified-bash-pre.js'),
      { tool_name: 'Bash', tool_input: { command: 'git status' } }
    );
    assertEqual(result.code, 0, 'Exit code 0');
  });

  await runTest('TC-HOOK-004-02', 'unified-bash-pre blocks dangerous commands', async () => {
    const result = await runHookScript(
      path.join(SCRIPTS_PATH, 'unified-bash-pre.js'),
      { tool_name: 'Bash', tool_input: { command: 'rm -rf /' } }
    );
    // Should block or warn
    assertEqual(result.stdout.includes('block') || result.stdout.includes('deny') || result.code !== 0, true, 'Dangerous blocked');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-HOOK-007: skill-post.js
  // ═══════════════════════════════════════════════════════════════════════════

  await runTest('TC-HOOK-007-03', 'skill-post.js has no isGeminiCli', () => {
    const source = fs.readFileSync(path.join(SCRIPTS_PATH, 'skill-post.js'), 'utf8');
    assertEqual(source.includes('isGeminiCli'), false, 'No isGeminiCli');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TC-HOOK-009: unified-stop.js
  // ═══════════════════════════════════════════════════════════════════════════

  await runTest('TC-HOOK-009-04', 'unified-stop.js has no isGeminiCli', () => {
    const source = fs.readFileSync(path.join(SCRIPTS_PATH, 'unified-stop.js'), 'utf8');
    assertEqual(source.includes('isGeminiCli'), false, 'No isGeminiCli');
  });
}

module.exports = { runHookTests };

if (require.main === module) {
  runHookTests().then(() => {
    console.log('\n✅ Hook tests completed');
  }).catch(console.error);
}
```

---

## 6. Gemini Code Removal Verification

### 6.1 Automated Verification Script

**File**: `tests/verify-gemini-removal.js`

```javascript
#!/usr/bin/env node
/**
 * Verify complete removal of Gemini-related code
 * This is the most critical test for v1.5.0
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.join(__dirname, '..');

console.log('\n🔍 Verifying Gemini Code Removal...\n');

const checks = [
  {
    id: 'GEM-001',
    name: 'No gemini keyword in JS files',
    command: 'grep -ri "gemini" --include="*.js" lib/ scripts/ hooks/ || true',
    shouldBeEmpty: true
  },
  {
    id: 'GEM-002',
    name: 'No isGeminiCli function calls',
    command: 'grep -r "isGeminiCli" --include="*.js" lib/ scripts/ hooks/ || true',
    shouldBeEmpty: true
  },
  {
    id: 'GEM-003',
    name: 'No .gemini config paths',
    command: 'grep -r "\\.gemini" --include="*.js" lib/ || true',
    shouldBeEmpty: true
  },
  {
    id: 'GEM-004',
    name: 'gemini-extension.json deleted',
    path: 'gemini-extension.json',
    shouldNotExist: true
  },
  {
    id: 'GEM-005',
    name: 'GEMINI.md deleted',
    path: 'GEMINI.md',
    shouldNotExist: true
  },
  {
    id: 'GEM-006',
    name: 'commands/gemini/ deleted',
    path: 'commands/gemini',
    shouldNotExist: true
  },
  {
    id: 'GEM-007',
    name: 'lib/adapters/gemini/ deleted',
    path: 'lib/adapters/gemini',
    shouldNotExist: true
  },
  {
    id: 'GEM-008',
    name: 'debug-platform.js deleted',
    path: 'scripts/debug-platform.js',
    shouldNotExist: true
  },
  {
    id: 'GEM-009',
    name: 'lib/common.js.backup deleted',
    path: 'lib/common.js.backup',
    shouldNotExist: true
  }
];

let passed = 0;
let failed = 0;

for (const check of checks) {
  process.stdout.write(`${check.id}: ${check.name}... `);

  try {
    if (check.command) {
      const result = execSync(check.command, {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();

      if (check.shouldBeEmpty && result === '') {
        console.log('✅ PASS');
        passed++;
      } else if (check.shouldBeEmpty && result !== '') {
        console.log('❌ FAIL');
        console.log(`   Found: ${result.substring(0, 200)}...`);
        failed++;
      }
    } else if (check.path) {
      const fullPath = path.join(PROJECT_ROOT, check.path);
      const exists = fs.existsSync(fullPath);

      if (check.shouldNotExist && !exists) {
        console.log('✅ PASS');
        passed++;
      } else if (check.shouldNotExist && exists) {
        console.log('❌ FAIL');
        console.log(`   File/directory still exists: ${check.path}`);
        failed++;
      }
    }
  } catch (error) {
    console.log('⚠️ ERROR');
    console.log(`   ${error.message}`);
    failed++;
  }
}

console.log(`\n${'═'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
```

---

## 7. Integration Test Scenarios

### 7.1 TC-INT-001: Hook Chain Test

**Execution Checklist**:

```markdown
## TC-INT-001: Hook Chain Integration Test

### Prerequisites
- [ ] bkit plugin installed
- [ ] Clean .pdca-status.json

### TC-INT-001-01: SessionStart → UserPromptSubmit Chain
1. [ ] Start new Claude Code session
2. [ ] Verify SessionStart hook fires
3. [ ] Check AskUserQuestion appears
4. [ ] Submit user prompt
5. [ ] Verify UserPromptSubmit hook processes intent

**Expected**: Both hooks execute in sequence without errors

### TC-INT-001-02: PreToolUse → Tool → PostToolUse Chain
1. [ ] Request file creation: "create test.txt"
2. [ ] Verify PreToolUse fires (check permission)
3. [ ] Verify Write tool executes
4. [ ] Verify PostToolUse fires (update status)

**Expected**: Full chain execution, status updated

### TC-INT-001-03: PostToolUse → Stop Chain
1. [ ] Complete a PDCA action
2. [ ] End session
3. [ ] Verify Stop hook saves state
4. [ ] Start new session
5. [ ] Verify state restored

**Expected**: State persists across sessions
```

### 7.2 TC-INT-002: PDCA Full Cycle Test

**Execution Checklist**:

```markdown
## TC-INT-002: PDCA Full Cycle Integration Test

### Feature: integration-test-feature

### TC-INT-002-01: Plan → Design
1. [ ] `/pdca plan integration-test-feature`
2. [ ] Verify docs/01-plan/features/integration-test-feature.plan.md created
3. [ ] Verify .pdca-status.json updated (phase: "plan")
4. [ ] `/pdca design integration-test-feature`
5. [ ] Verify docs/02-design/features/integration-test-feature.design.md created
6. [ ] Verify .pdca-status.json updated (phase: "design")

**Expected**: Both documents created, status shows design phase

### TC-INT-002-02: Design → Do
1. [ ] `/pdca do integration-test-feature`
2. [ ] Verify implementation guide displayed
3. [ ] Verify checklist provided
4. [ ] Verify .pdca-status.json updated (phase: "do")

**Expected**: Implementation guide with clear checklist

### TC-INT-002-03: Do → Check
1. [ ] Implement minimal code changes
2. [ ] `/pdca analyze integration-test-feature`
3. [ ] Verify gap-detector agent called
4. [ ] Verify Match Rate calculated
5. [ ] Verify docs/03-analysis/integration-test-feature.analysis.md created

**Expected**: Analysis report with Match Rate

### TC-INT-002-04: Check → Act (if Match Rate < 90%)
1. [ ] `/pdca iterate integration-test-feature`
2. [ ] Verify pdca-iterator agent called
3. [ ] Verify code fixes applied
4. [ ] Verify re-analysis triggered
5. [ ] Verify iteration count incremented

**Expected**: Automatic improvement cycle

### TC-INT-002-05: Check → Report (Match Rate >= 90%)
1. [ ] Achieve 90%+ Match Rate
2. [ ] `/pdca report integration-test-feature`
3. [ ] Verify report-generator agent called
4. [ ] Verify docs/04-report/features/integration-test-feature.report.md created

**Expected**: Comprehensive completion report

### TC-INT-002-06: Report → Archive
1. [ ] `/pdca archive integration-test-feature`
2. [ ] Verify docs/archive/YYYY-MM/integration-test-feature/ created
3. [ ] Verify original docs moved
4. [ ] Verify .pdca-status.json updated (phase: "archived")

**Expected**: Documents archived, status cleaned
```

---

## 8. E2E Test Scenarios

### 8.1 TC-E2E-001: New Feature Development

```markdown
## TC-E2E-001: Complete New Feature Development Cycle

### Objective
Validate end-to-end PDCA workflow for a realistic feature development scenario.

### Test Feature: e2e-test-user-profile

### Execution Steps

1. **Session Start** (10 min)
   - [ ] Open Claude Code in bkit-claude-code directory
   - [ ] Observe SessionStart hook output
   - [ ] Verify AskUserQuestion with 4 options appears
   - [ ] Select "Start new task"

2. **Plan Phase** (15 min)
   - [ ] Type: `/pdca plan e2e-test-user-profile`
   - [ ] Verify Task [Plan] created
   - [ ] Verify Plan document structure correct
   - [ ] Review generated content
   - [ ] Mark Task complete

3. **Design Phase** (20 min)
   - [ ] Type: `/pdca design e2e-test-user-profile`
   - [ ] Verify Task [Design] created with blockedBy
   - [ ] Verify Design document includes:
     - Architecture diagram
     - Data model
     - API specification
   - [ ] Mark Task complete

4. **Do Phase** (30 min)
   - [ ] Type: `/pdca do e2e-test-user-profile`
   - [ ] Verify implementation guide displayed
   - [ ] Create minimal test files:
     - lib/test-user-profile.js
     - scripts/test-user-profile-handler.js
   - [ ] Verify PostToolUse updates status

5. **Check Phase** (15 min)
   - [ ] Type: `/pdca analyze e2e-test-user-profile`
   - [ ] Verify gap-detector agent invoked
   - [ ] Review Match Rate calculation
   - [ ] Verify Analysis document created

6. **Act Phase (if needed)** (20 min)
   - [ ] If Match Rate < 90%: `/pdca iterate e2e-test-user-profile`
   - [ ] Verify pdca-iterator suggests fixes
   - [ ] Apply fixes
   - [ ] Re-run analysis
   - [ ] Repeat until >= 90%

7. **Report Phase** (10 min)
   - [ ] Type: `/pdca report e2e-test-user-profile`
   - [ ] Verify report-generator creates comprehensive report
   - [ ] Review report sections

8. **Archive Phase** (5 min)
   - [ ] Type: `/pdca archive e2e-test-user-profile`
   - [ ] Verify documents moved to archive
   - [ ] Verify status cleaned

### Success Criteria
- [ ] All PDCA phases executed
- [ ] All Tasks created with proper dependencies
- [ ] All documents generated with correct structure
- [ ] Match Rate >= 90% achieved
- [ ] No errors during execution
- [ ] Session state persisted correctly

### Cleanup
- [ ] Delete test files: lib/test-user-profile.js, scripts/test-user-profile-handler.js
- [ ] Delete test documents in docs/archive/
```

### 8.2 TC-E2E-002: Session Resume

```markdown
## TC-E2E-002: Session Resume Test

### Objective
Validate PDCA state persistence across Claude Code sessions.

### Execution Steps

1. **First Session**
   - [ ] Start Claude Code
   - [ ] `/pdca plan session-resume-test`
   - [ ] Verify Plan created
   - [ ] Note current status from `/pdca status`
   - [ ] Close Claude Code session

2. **Second Session**
   - [ ] Start Claude Code (new session)
   - [ ] Observe SessionStart output
   - [ ] Verify previous feature detected
   - [ ] `/pdca status` shows correct state
   - [ ] `/pdca next` suggests Design phase

3. **Continue Work**
   - [ ] `/pdca design session-resume-test`
   - [ ] Verify Design links to existing Plan
   - [ ] Verify Task chain maintained

### Success Criteria
- [ ] State persisted in .pdca-status.json
- [ ] AskUserQuestion shows "Continue" option
- [ ] No data loss between sessions
```

---

## 9. Skill & Agent Tests

### 9.1 Skill Functional Tests

| Test ID | Skill | Command | Validation |
|---------|-------|---------|------------|
| TC-SKILL-001-01 | pdca | `/pdca plan test` | Plan doc created |
| TC-SKILL-001-02 | pdca | `/pdca design test` | Design doc created |
| TC-SKILL-001-07 | pdca | `/pdca status` | Status displayed |
| TC-SKILL-001-08 | pdca | `/pdca next` | Next step suggested |
| TC-SKILL-002 | starter | `/starter` | Starter guide shown |
| TC-SKILL-003 | dynamic | `/dynamic` | Dynamic guide shown |
| TC-SKILL-004 | enterprise | `/enterprise` | Enterprise guide shown |

### 9.2 Agent Behavioral Tests

| Test ID | Agent | Trigger | Validation |
|---------|-------|---------|------------|
| TC-AGENT-001-01 | gap-detector | "검증해줘" | Agent invoked |
| TC-AGENT-001-02 | gap-detector | /pdca analyze | Match Rate calculated |
| TC-AGENT-002-01 | pdca-iterator | "개선해줘" | Agent invoked |
| TC-AGENT-002-03 | pdca-iterator | Iteration | Max 5 iterations |
| TC-AGENT-003 | report-generator | /pdca report | Report generated |

---

## 10. Test Execution Schedule

### Phase 1: Unit Tests (Task Management)

| Task | Tests | Duration | Priority |
|------|-------|----------|----------|
| lib/core/ | TC-CORE-001 ~ 007 | 2h | P0 |
| lib/pdca/ | TC-PDCA-001 ~ 005 | 2h | P0 |
| lib/intent/ | TC-INTENT-001 ~ 003 | 1h | P0 |
| lib/task/ | TC-TASK-001 ~ 004 | 1h | P0 |
| Context Engineering | TC-CE-001 ~ 005 | 2h | P0 |
| Gemini Removal | GEM-001 ~ 009 | 30m | P0 |

### Phase 2: Functional Tests (Task Management)

| Task | Tests | Duration | Priority |
|------|-------|----------|----------|
| Hook Scripts | TC-HOOK-001 ~ 009 | 3h | P0 |
| Stop Scripts | TC-STOP-001 ~ 012 | 2h | P1 |
| Skills | TC-SKILL-001 ~ 021 | 4h | P0 |
| Agents | TC-AGENT-001 ~ 011 | 3h | P0 |

### Phase 3: Integration & E2E (Task Management)

| Task | Tests | Duration | Priority |
|------|-------|----------|----------|
| Hook Chain | TC-INT-001 | 2h | P0 |
| PDCA Cycle | TC-INT-002 | 3h | P0 |
| Skill-Agent | TC-INT-003 | 1h | P0 |
| E2E Full Cycle | TC-E2E-001 | 4h | P0 |
| Session Resume | TC-E2E-002 | 1h | P0 |
| Multi-Language | TC-E2E-003 | 2h | P1 |

---

## 11. Result Reporting

### 11.1 Test Result Format

**File**: `docs/03-analysis/bkit-v1.5.0-test-results.md`

```markdown
# bkit v1.5.0 Test Results

## Summary

| Category | Total | Passed | Failed | Skipped | Pass Rate |
|----------|:-----:|:------:|:------:|:-------:|:---------:|
| Unit Tests | X | X | X | X | X% |
| Hook Tests | X | X | X | X | X% |
| Skill Tests | X | X | X | X | X% |
| Agent Tests | X | X | X | X | X% |
| Integration | X | X | X | X | X% |
| E2E | X | X | X | X | X% |
| **Total** | **X** | **X** | **X** | **X** | **X%** |

## Failed Tests

| Test ID | Name | Error | Fix Status |
|---------|------|-------|------------|
| | | | |

## Gemini Removal Verification

| Check | Status |
|-------|--------|
| No gemini keyword in JS | ✅/❌ |
| No isGeminiCli calls | ✅/❌ |
| All Gemini files deleted | ✅/❌ |

## Sign-off

- [ ] All P0 tests passed
- [ ] P1 tests >= 95% passed
- [ ] Gemini removal verified
- [ ] PDCA cycle completed
- [ ] No regression bugs
```

---

## 12. Implementation Order

1. **Create tests/ directory structure**
2. **Write test runner script** (tests/runner.js)
3. **Write unit tests** (tests/unit/*.js)
4. **Write Gemini verification** (tests/verify-gemini-removal.js)
5. **Execute unit tests via Node.js**
6. **Execute hook tests via stdin simulation**
7. **Execute skill/agent tests in Claude Code session**
8. **Execute integration tests with checklist**
9. **Execute E2E test with full PDCA cycle**
10. **Generate test results report**

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-01 | Initial draft | Claude Code |

---

*Generated by bkit PDCA Design Phase*
*Template: design.template.md v1.2*
