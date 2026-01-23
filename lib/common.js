#!/usr/bin/env node
/**
 * bkit Common Library (v1.3.1)
 * Cross-platform utility functions for bkit hooks
 *
 * Converted from: lib/common.sh
 * Platform: Windows, macOS, Linux
 * Dependencies: Node.js only (no external tools like jq, bash)
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// Environment & Configuration
// ============================================================

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// Default patterns (configurable via bkit.config.json)
const DEFAULT_EXCLUDE_PATTERNS = [
  'node_modules', '.git', 'dist', 'build', '.next',
  '__pycache__', '.venv', 'venv', 'coverage',
  '.pytest_cache', 'target', '.cargo', 'vendor'
];

const DEFAULT_FEATURE_PATTERNS = [
  'features', 'modules', 'packages', 'apps', 'services', 'domains'
];

// Language Tier System (v1.2.1)
const TIER_EXTENSIONS = {
  1: ['py', 'pyx', 'pyi', 'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'],
  2: ['go', 'rs', 'dart', 'astro', 'vue', 'svelte', 'mdx'],
  3: ['java', 'kt', 'kts', 'swift', 'c', 'cpp', 'cc', 'h', 'hpp', 'sh', 'bash'],
  4: ['php', 'rb', 'erb', 'cs', 'scala', 'ex', 'exs'],
  experimental: ['mojo', 'zig', 'v']
};

// ============================================================
// 1. Configuration Management
// ============================================================

let _configCache = null;

/**
 * Load bkit.config.json
 * @returns {Object} Configuration object or empty object
 */
function loadConfig() {
  if (_configCache !== null) return _configCache;

  const configPath = path.join(PROJECT_DIR, 'bkit.config.json');
  try {
    if (fs.existsSync(configPath)) {
      _configCache = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return _configCache;
    }
  } catch (e) { /* ignore */ }
  _configCache = {};
  return _configCache;
}

/**
 * Get configuration value by path
 * @param {string} keyPath - Dot-separated path (e.g., "pdca.thresholds.quickFix")
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Configuration value or default
 */
function getConfig(keyPath, defaultValue = null) {
  const config = loadConfig();
  const keys = keyPath.replace(/^\./, '').split('.');
  let value = config;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  return value ?? defaultValue;
}

/**
 * Get configuration array as space-separated string (for compatibility)
 * @param {string} keyPath - Configuration path
 * @param {string} defaultValue - Default space-separated string
 * @returns {string} Space-separated values
 */
function getConfigArray(keyPath, defaultValue = '') {
  const value = getConfig(keyPath, null);
  if (Array.isArray(value)) {
    return value.join(' ');
  }
  return defaultValue;
}

// ============================================================
// 2. File Detection Functions
// ============================================================

/**
 * Check if file is a source code file
 * @param {string} filePath - File path to check
 * @returns {boolean} True if source file
 */
function isSourceFile(filePath) {
  if (!filePath) return false;

  // Exclude patterns
  const excludePatterns = getConfig('excludePatterns', DEFAULT_EXCLUDE_PATTERNS);
  for (const pattern of excludePatterns) {
    if (filePath.includes(pattern)) return false;
  }

  // Exclude documentation and config files
  const excludeExtensions = ['.md', '.json', '.yaml', '.yml', '.lock', '.txt', '.log'];
  const ext = path.extname(filePath).toLowerCase();
  if (excludeExtensions.includes(ext)) return false;

  // Exclude hidden files
  const basename = path.basename(filePath);
  if (basename.startsWith('.')) return false;

  return isCodeFile(filePath);
}

/**
 * Check if file has recognized code extension
 * @param {string} filePath - File path to check
 * @returns {boolean} True if code file
 */
function isCodeFile(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  if (!ext) return false;

  for (const tier of Object.values(TIER_EXTENSIONS)) {
    if (tier.includes(ext)) return true;
  }
  return false;
}

/**
 * Check if file is a UI component file
 * @param {string} filePath - File path
 * @returns {boolean} True if UI file
 */
function isUiFile(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return ['tsx', 'jsx', 'vue', 'svelte', 'astro'].includes(ext);
}

/**
 * Check if file is an environment file
 * @param {string} filePath - File path
 * @returns {boolean} True if env file
 */
function isEnvFile(filePath) {
  const basename = path.basename(filePath);
  return basename.includes('.env') || basename.startsWith('.env');
}

// ============================================================
// 3. Tier Detection Functions
// ============================================================

/**
 * Get language tier for file
 * @param {string} filePath - File path
 * @returns {string} Tier: "1"|"2"|"3"|"4"|"experimental"|"unknown"
 */
function getLanguageTier(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();

  for (const [tier, extensions] of Object.entries(TIER_EXTENSIONS)) {
    if (extensions.includes(ext)) return String(tier);
  }
  return 'unknown';
}

/**
 * Get tier description
 * @param {string} tier - Tier number or name
 * @returns {string} Description
 */
function getTierDescription(tier) {
  const descriptions = {
    '1': 'AI-Native Essential',
    '2': 'Mainstream Recommended',
    '3': 'Domain Specific',
    '4': 'Legacy/Niche',
    'experimental': 'Experimental'
  };
  return descriptions[tier] || 'Unknown';
}

/**
 * Get PDCA guidance for tier
 * @param {string} tier - Tier
 * @returns {string} Guidance message
 */
function getTierPdcaGuidance(tier) {
  const guidance = {
    '1': 'Tier 1 (AI-Native): Full PDCA support. Vibe coding optimized.',
    '2': 'Tier 2 (Mainstream): Good PDCA support. Most features available.',
    '3': 'Tier 3 (Domain): Basic PDCA support. Some limitations may apply.',
    '4': 'Tier 4 (Legacy): Limited PDCA support. Consider migration.',
    'experimental': 'Experimental: PDCA support varies. Use with caution.'
  };
  return guidance[tier] || '';
}

// Convenience tier check functions
const isTier1 = (filePath) => getLanguageTier(filePath) === '1';
const isTier2 = (filePath) => getLanguageTier(filePath) === '2';
const isTier3 = (filePath) => getLanguageTier(filePath) === '3';
const isTier4 = (filePath) => getLanguageTier(filePath) === '4';
const isExperimentalTier = (filePath) => getLanguageTier(filePath) === 'experimental';

// ============================================================
// 4. Feature Detection
// ============================================================

/**
 * Extract feature name from file path
 * @param {string} filePath - File path
 * @returns {string} Feature name or empty string
 */
function extractFeature(filePath) {
  if (!filePath) return '';

  const featurePatterns = getConfig('featurePatterns', DEFAULT_FEATURE_PATTERNS);
  const genericNames = [
    'src', 'lib', 'app', 'components', 'pages', 'utils', 'hooks',
    'types', 'internal', 'cmd', 'pkg', 'models', 'views',
    'routers', 'controllers', 'services'
  ];

  // Try configured feature patterns
  for (const pattern of featurePatterns) {
    const regex = new RegExp(`${pattern}/([^/]+)`);
    const match = filePath.match(regex);
    if (match && match[1] && !genericNames.includes(match[1])) {
      return match[1];
    }
  }

  // Fallback: extract from parent directory
  const parts = filePath.split(/[/\\]/).filter(Boolean);
  for (let i = parts.length - 2; i >= 0; i--) {
    if (!genericNames.includes(parts[i])) {
      return parts[i];
    }
  }

  return '';
}

// ============================================================
// 5. PDCA Document Detection
// ============================================================

/**
 * Find design document for feature
 * @param {string} feature - Feature name
 * @returns {string} Path to design doc or empty string
 */
function findDesignDoc(feature) {
  if (!feature) return '';

  const paths = [
    path.join(PROJECT_DIR, `docs/02-design/features/${feature}.design.md`),
    path.join(PROJECT_DIR, `docs/02-design/${feature}.design.md`),
    path.join(PROJECT_DIR, `docs/design/${feature}.md`)
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return '';
}

/**
 * Find plan document for feature
 * @param {string} feature - Feature name
 * @returns {string} Path to plan doc or empty string
 */
function findPlanDoc(feature) {
  if (!feature) return '';

  const paths = [
    path.join(PROJECT_DIR, `docs/01-plan/features/${feature}.plan.md`),
    path.join(PROJECT_DIR, `docs/01-plan/${feature}.plan.md`),
    path.join(PROJECT_DIR, `docs/plan/${feature}.md`)
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return '';
}

// ============================================================
// 6. Task Classification
// ============================================================

/**
 * Classify task by content length (legacy, character-based)
 * @param {string} content - Content to classify
 * @returns {string} Classification
 */
function classifyTask(content) {
  const length = (content || '').length;

  const quickFix = getConfig('taskClassification.thresholds.quickFix', 50);
  const minorChange = getConfig('taskClassification.thresholds.minorChange', 200);
  const feature = getConfig('taskClassification.thresholds.feature', 1000);

  if (length < quickFix) return 'quick_fix';
  if (length < minorChange) return 'minor_change';
  if (length < feature) return 'feature';
  return 'major_feature';
}

/**
 * Classify task by line count (v1.3.0, more accurate)
 * @param {string} content - Content to classify
 * @returns {string} Classification
 */
function classifyTaskByLines(content) {
  const lines = (content || '').split('\n');
  const lineCount = lines.length;

  const quickFix = getConfig('taskClassification.lines.quickFix', 10);
  const minorChange = getConfig('taskClassification.lines.minorChange', 50);
  const feature = getConfig('taskClassification.lines.feature', 200);

  if (lineCount < quickFix) return 'quick_fix';
  if (lineCount < minorChange) return 'minor_change';
  if (lineCount < feature) return 'feature';
  return 'major_feature';
}

/**
 * Get PDCA level from classification
 * @param {string} classification - Task classification
 * @returns {string} PDCA level
 */
function getPdcaLevel(classification) {
  const levels = {
    'quick_fix': 'none',
    'minor_change': 'light',
    'feature': 'recommended',
    'major_feature': 'required'
  };
  return levels[classification] || 'none';
}

/**
 * Get PDCA guidance message
 * @param {string} classification - Task classification
 * @returns {string} Guidance message
 */
function getPdcaGuidance(classification) {
  const guidance = {
    'quick_fix': '',
    'minor_change': 'Minor change. PDCA optional.',
    'feature': 'Feature-level change. Design doc recommended. Run /pdca-design.',
    'major_feature': 'Major feature. Design doc strongly recommended. Run /pdca-plan first.'
  };
  return guidance[classification] || '';
}

/**
 * Get contextual PDCA guidance by level
 * @param {string} level - PDCA level
 * @param {string} feature - Feature name
 * @param {number} lineCount - Line count
 * @returns {string} Guidance message
 */
function getPdcaGuidanceByLevel(level, feature = '', lineCount = 0) {
  const lineInfo = lineCount > 0 ? ` (${lineCount} lines)` : '';
  const featureInfo = feature ? ` for '${feature}'` : '';

  switch (level) {
    case 'none':
      return '';
    case 'light':
      return `Minor change${lineInfo}. PDCA optional.`;
    case 'recommended':
      return `Feature${lineInfo}. Design doc recommended${featureInfo}.`;
    case 'required':
      return `Major feature${lineInfo}. Design doc strongly recommended${featureInfo}.`;
    default:
      return '';
  }
}

// ============================================================
// 7. JSON Output Helpers
// ============================================================

/**
 * Output allow decision with context
 * @param {string} context - Additional context
 */
function outputAllow(context = '') {
  if (context) {
    console.log(JSON.stringify({
      decision: 'allow',
      hookSpecificOutput: { additionalContext: context }
    }));
  } else {
    console.log('{}');
  }
}

/**
 * Output block decision with reason and exit
 * @param {string} reason - Block reason
 */
function outputBlock(reason) {
  console.log(JSON.stringify({
    decision: 'block',
    reason: reason
  }));
  process.exit(2);
}

/**
 * Output empty JSON
 */
function outputEmpty() {
  console.log('{}');
}

// ============================================================
// 8. Level Detection
// ============================================================

/**
 * Detect project level from CLAUDE.md or structure
 * @returns {string} "Starter" | "Dynamic" | "Enterprise"
 */
function detectLevel() {
  // 1. Check CLAUDE.md for explicit declaration
  const claudeMd = path.join(PROJECT_DIR, 'CLAUDE.md');
  if (fs.existsSync(claudeMd)) {
    try {
      const content = fs.readFileSync(claudeMd, 'utf8');
      const match = content.match(/^level:\s*(\w+)/im);
      if (match) {
        const level = match[1].toLowerCase();
        if (['starter', 'dynamic', 'enterprise'].includes(level)) {
          return level.charAt(0).toUpperCase() + level.slice(1);
        }
      }
    } catch (e) { /* ignore */ }
  }

  // 2. Check for Enterprise indicators
  const enterpriseDirs = ['kubernetes', 'terraform', 'k8s', 'infra'];
  for (const dir of enterpriseDirs) {
    const dirPath = path.join(PROJECT_DIR, dir);
    if (fs.existsSync(dirPath)) {
      try {
        if (fs.statSync(dirPath).isDirectory()) return 'Enterprise';
      } catch (e) { /* ignore */ }
    }
  }

  // 3. Check for Dynamic indicators
  const mcpJson = path.join(PROJECT_DIR, '.mcp.json');
  if (fs.existsSync(mcpJson)) {
    try {
      const content = fs.readFileSync(mcpJson, 'utf8');
      if (content.includes('bkend')) return 'Dynamic';
    } catch (e) { /* ignore */ }
  }

  const dynamicIndicators = ['lib/bkend', 'supabase', 'docker-compose.yml', 'api', 'backend'];
  for (const indicator of dynamicIndicators) {
    if (fs.existsSync(path.join(PROJECT_DIR, indicator))) {
      return 'Dynamic';
    }
  }

  // 4. Default to Starter
  return 'Starter';
}

// ============================================================
// 9. Input Helpers (New for v1.3.1)
// ============================================================

/**
 * Read JSON from stdin synchronously
 * @returns {Object} Parsed JSON or empty object
 */
function readStdinSync() {
  try {
    // Read from file descriptor 0 (stdin)
    const data = fs.readFileSync(0, 'utf8');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Read JSON from stdin asynchronously
 * @returns {Promise<Object>} Parsed JSON
 */
async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
    process.stdin.on('error', () => resolve({}));
  });
}

/**
 * Parse hook input and extract common fields
 * @param {Object} input - Raw hook input
 * @returns {Object} Parsed fields
 */
function parseHookInput(input) {
  return {
    toolName: input.tool_name || '',
    filePath: input.tool_input?.file_path || input.tool_input?.path || '',
    content: input.tool_input?.content || input.tool_input?.new_string || '',
    command: input.tool_input?.command || '',
    oldString: input.tool_input?.old_string || ''
  };
}

// ============================================================
// 10. Task System Integration (v1.3.1 - FR-01~05)
// ============================================================

/**
 * PDCA Phase definitions for Task System integration
 */
const PDCA_PHASES = {
  plan: { order: 1, name: 'Plan', emoji: '📋' },
  design: { order: 2, name: 'Design', emoji: '📐' },
  do: { order: 3, name: 'Do', emoji: '🔨' },
  check: { order: 4, name: 'Check', emoji: '🔍' },
  act: { order: 5, name: 'Act', emoji: '🔄' }
};

/**
 * Generate PDCA Task metadata for Task System integration
 * @param {string} phase - PDCA phase (plan|design|do|check|act)
 * @param {string} feature - Feature name
 * @param {Object} options - Additional options
 * @returns {Object} Task metadata
 */
function getPdcaTaskMetadata(phase, feature, options = {}) {
  const phaseInfo = PDCA_PHASES[phase.toLowerCase()] || PDCA_PHASES.do;

  return {
    pdcaPhase: phase.toLowerCase(),
    pdcaOrder: phaseInfo.order,
    feature: feature || '',
    level: options.level || detectLevel(),
    createdAt: new Date().toISOString(),
    ...options
  };
}

/**
 * Generate Task subject for PDCA phase
 * @param {string} phase - PDCA phase
 * @param {string} feature - Feature name
 * @returns {string} Task subject
 */
function generatePdcaTaskSubject(phase, feature) {
  const phaseInfo = PDCA_PHASES[phase.toLowerCase()] || PDCA_PHASES.do;
  const featureName = feature || 'current task';
  return `[${phaseInfo.name}] ${featureName}`;
}

/**
 * Generate Task description for PDCA phase
 * @param {string} phase - PDCA phase
 * @param {string} feature - Feature name
 * @param {string} docPath - Document path if applicable
 * @returns {string} Task description
 */
function generatePdcaTaskDescription(phase, feature, docPath = '') {
  const phaseDescriptions = {
    plan: `Feature planning for '${feature}'.\nDocument: ${docPath || `docs/01-plan/features/${feature}.plan.md`}`,
    design: `Feature design for '${feature}'.\nDocument: ${docPath || `docs/02-design/features/${feature}.design.md`}`,
    do: `Implementation of '${feature}'.`,
    check: `Gap analysis for '${feature}'.\nDocument: ${docPath || `docs/03-analysis/${feature}.analysis.md`}`,
    act: `Iteration/Report for '${feature}'.\nDocument: ${docPath || `docs/04-report/${feature}.report.md`}`
  };

  return phaseDescriptions[phase.toLowerCase()] || `PDCA ${phase} for ${feature}`;
}

/**
 * Generate Task creation guidance for hooks
 * @param {string} phase - PDCA phase
 * @param {string} feature - Feature name
 * @param {string} blockedByPhase - Previous phase that blocks this (optional)
 * @returns {string} Guidance message for additionalContext
 */
function generateTaskGuidance(phase, feature, blockedByPhase = '') {
  const phaseInfo = PDCA_PHASES[phase.toLowerCase()];
  if (!phaseInfo) return '';

  const subject = generatePdcaTaskSubject(phase, feature);
  const metadata = getPdcaTaskMetadata(phase, feature);

  let guidance = `💡 Task System: Create task "${subject}" with metadata ${JSON.stringify(metadata)}`;

  if (blockedByPhase) {
    const prevPhaseInfo = PDCA_PHASES[blockedByPhase.toLowerCase()];
    if (prevPhaseInfo) {
      guidance += ` | blockedBy: [${prevPhaseInfo.name}] ${feature}`;
    }
  }

  return guidance;
}

/**
 * Get the previous PDCA phase for dependency
 * @param {string} currentPhase - Current PDCA phase
 * @returns {string|null} Previous phase or null
 */
function getPreviousPdcaPhase(currentPhase) {
  const order = {
    plan: null,
    design: 'plan',
    do: 'design',
    check: 'do',
    act: 'check'
  };
  return order[currentPhase.toLowerCase()] || null;
}

/**
 * Find existing PDCA status file
 * @returns {Object|null} PDCA status or null
 */
function findPdcaStatus() {
  const statusPath = path.join(PROJECT_DIR, 'docs/.pdca-status.json');
  try {
    if (fs.existsSync(statusPath)) {
      return JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return null;
}

/**
 * Get current PDCA phase from status
 * @param {string} feature - Feature name
 * @returns {string|null} Current phase or null
 */
function getCurrentPdcaPhase(feature) {
  const status = findPdcaStatus();
  if (!status || !status.features) return null;

  const featureStatus = status.features[feature];
  if (!featureStatus) return null;

  return featureStatus.currentPhase || null;
}

// ============================================================
// Exports
// ============================================================

module.exports = {
  // Configuration
  getConfig,
  getConfigArray,
  loadConfig,

  // File Detection
  isSourceFile,
  isCodeFile,
  isUiFile,
  isEnvFile,

  // Tier Detection
  getLanguageTier,
  getTierDescription,
  getTierPdcaGuidance,
  isTier1,
  isTier2,
  isTier3,
  isTier4,
  isExperimentalTier,

  // Feature Detection
  extractFeature,

  // PDCA Document Detection
  findDesignDoc,
  findPlanDoc,

  // Task Classification
  classifyTask,
  classifyTaskByLines,
  getPdcaLevel,
  getPdcaGuidance,
  getPdcaGuidanceByLevel,

  // JSON Output
  outputAllow,
  outputBlock,
  outputEmpty,

  // Level Detection
  detectLevel,

  // Input Helpers
  readStdin,
  readStdinSync,
  parseHookInput,

  // Constants
  PLUGIN_ROOT,
  PROJECT_DIR,
  TIER_EXTENSIONS,
  DEFAULT_EXCLUDE_PATTERNS,
  DEFAULT_FEATURE_PATTERNS,

  // Task System Integration (v1.3.1 - FR-01~05)
  PDCA_PHASES,
  getPdcaTaskMetadata,
  generatePdcaTaskSubject,
  generatePdcaTaskDescription,
  generateTaskGuidance,
  getPreviousPdcaPhase,
  findPdcaStatus,
  getCurrentPdcaPhase
};
