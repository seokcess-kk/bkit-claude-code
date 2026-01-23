#!/usr/bin/env node
/**
 * pdca-post-write.js - Guide next steps after Write operation
 *
 * Purpose: Suggest gap analysis after source file modifications
 * Hook: PostToolUse (Write) for bkit-rules skill
 *
 * Converted from: scripts/pdca-post-write.sh
 */

const fs = require('fs');
const path = require('path');
const {
  readStdinSync,
  parseHookInput,
  isSourceFile,
  extractFeature,
  outputAllow,
  outputEmpty,
  generateTaskGuidance,
  PROJECT_DIR
} = require('../lib/common.js');

// Read input from stdin
const input = readStdinSync();
const { filePath } = parseHookInput(input);

// Skip non-source files
if (!isSourceFile(filePath)) {
  outputEmpty();
  process.exit(0);
}

// Extract feature name
const feature = extractFeature(filePath);

// Skip if no feature detected
if (!feature) {
  outputEmpty();
  process.exit(0);
}

// Check if design doc exists for gap analysis suggestion
const designDocPaths = [
  path.join(PROJECT_DIR, `docs/02-design/features/${feature}.design.md`),
  path.join(PROJECT_DIR, `docs/02-design/${feature}.design.md`)
];

const hasDesignDoc = designDocPaths.some(p => fs.existsSync(p));

if (hasDesignDoc) {
  // Generate Task guidance for PDCA workflow
  const taskGuidance = generateTaskGuidance('do', feature, 'design');
  const context = `Write completed: ${filePath}\n\nWhen implementation is finished, run /pdca-analyze ${feature} to verify design-implementation alignment.\n\n${taskGuidance}`;
  outputAllow(context);
} else {
  outputEmpty();
}
