#!/usr/bin/env node
/**
 * pre-write.js - Unified PreToolUse hook for Write|Edit operations (v1.3.1)
 *
 * Purpose: PDCA check, task classification, convention hints
 * Hook: PreToolUse (Write|Edit)
 * Philosophy: Automation First - Guide, don't block
 *
 * Converted from: scripts/pre-write.sh
 */

const {
  readStdinSync,
  parseHookInput,
  isSourceFile,
  isCodeFile,
  isEnvFile,
  extractFeature,
  findDesignDoc,
  findPlanDoc,
  classifyTaskByLines,
  getPdcaLevel,
  outputAllow,
  outputEmpty,
  generateTaskGuidance
} = require('../lib/common.js');

// Read input from stdin
const input = readStdinSync();
const { filePath, content } = parseHookInput(input);

// Skip if no file path
if (!filePath) {
  outputEmpty();
  process.exit(0);
}

// Collect context messages
const contextParts = [];

// ============================================================
// 1. Task Classification (v1.3.0 - Line-based, Automation First)
// ============================================================
let classification = 'quick_fix';
let pdcaLevel = 'none';
let lineCount = 0;

if (content) {
  lineCount = content.split('\n').length;
  classification = classifyTaskByLines(content);
  pdcaLevel = getPdcaLevel(classification);
}

// ============================================================
// 2. PDCA Document Check (for source files)
// ============================================================
let feature = '';
let designDoc = '';
let planDoc = '';

if (isSourceFile(filePath)) {
  feature = extractFeature(filePath);

  if (feature) {
    designDoc = findDesignDoc(feature);
    planDoc = findPlanDoc(feature);
  }
}

// ============================================================
// 3. Generate PDCA Guidance (v1.3.0 - No blocking, guide only)
// ============================================================
switch (pdcaLevel) {
  case 'none':
    // Quick Fix - no guidance needed
    break;
  case 'light':
    // Minor Change - light mention
    contextParts.push(`Minor change (${lineCount} lines). PDCA optional.`);
    break;
  case 'recommended':
    // Feature - recommend design doc
    if (designDoc) {
      contextParts.push(`Feature (${lineCount} lines). Design doc exists: ${designDoc}`);
    } else if (feature) {
      contextParts.push(`Feature (${lineCount} lines). Design doc recommended for '${feature}'. Consider /pdca-design ${feature}`);
    } else {
      contextParts.push(`Feature-level change (${lineCount} lines). Design doc recommended.`);
    }
    break;
  case 'required':
    // Major Feature - strongly recommend (but don't block)
    if (designDoc) {
      contextParts.push(`Major feature (${lineCount} lines). Design doc exists: ${designDoc}. Refer during implementation.`);
    } else if (feature) {
      contextParts.push(`Major feature (${lineCount} lines) without design doc. Strongly recommend /pdca-design ${feature} first.`);
    } else {
      contextParts.push(`Major feature (${lineCount} lines). Design doc strongly recommended before implementation.`);
    }
    break;
}

// Add reference to existing PDCA docs if not already mentioned
if (planDoc && !designDoc && pdcaLevel !== 'none' && pdcaLevel !== 'light') {
  contextParts.push(`Plan exists at ${planDoc}. Design doc not yet created.`);
}

// ============================================================
// 4. Convention Hints (for code files)
// ============================================================
if (isCodeFile(filePath)) {
  // Only add convention hints for larger changes
  if (pdcaLevel === 'recommended' || pdcaLevel === 'required') {
    contextParts.push('Conventions: Components=PascalCase, Functions=camelCase, Constants=UPPER_SNAKE_CASE');
  }
} else if (isEnvFile(filePath)) {
  contextParts.push('Env naming: NEXT_PUBLIC_* (client), DB_* (database), API_* (external), AUTH_* (auth)');
}

// ============================================================
// 5. Task System Guidance (v1.3.1 - FR-02)
// ============================================================
if (feature && (pdcaLevel === 'recommended' || pdcaLevel === 'required')) {
  const taskHint = generateTaskGuidance('do', feature, 'design');
  contextParts.push(taskHint);
}

// ============================================================
// Output combined context
// ============================================================
if (contextParts.length > 0) {
  outputAllow(contextParts.join(' | '));
} else {
  outputEmpty();
}
