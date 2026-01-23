#!/usr/bin/env node
/**
 * pdca-pre-write.js - DEPRECATED: Merged into pre-write.js
 *
 * Purpose: Legacy PDCA phase detection (functionality merged into pre-write.js v1.3.0)
 * Hook: PreToolUse (Write|Edit)
 *
 * This script is kept for backwards compatibility but functionality
 * has been consolidated into pre-write.js
 *
 * Converted from: scripts/pdca-pre-write.sh
 */

const {
  readStdinSync,
  parseHookInput,
  isSourceFile,
  extractFeature,
  outputAllow,
  outputEmpty
} = require('../lib/common.js');

// Read input from stdin
const input = readStdinSync();
const { filePath, toolName } = parseHookInput(input);

// Skip non-source files
if (!isSourceFile(filePath)) {
  outputEmpty();
  process.exit(0);
}

// Extract feature for context
const feature = extractFeature(filePath);

// Provide minimal context (main logic is in pre-write.js)
if (feature) {
  outputAllow(`PDCA context: Editing ${toolName} for feature '${feature}'.`);
} else {
  outputEmpty();
}
