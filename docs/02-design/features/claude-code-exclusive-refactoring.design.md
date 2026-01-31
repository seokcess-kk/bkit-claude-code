# Claude Code Exclusive Refactoring Design Document

> **Summary**: bkit을 Claude Code 전용 플러그인으로 리팩토링하기 위한 상세 설계서 - Gemini 관련 코드 제거 명세
>
> **Project**: bkit (Vibecoding Kit)
> **Version**: v1.4.7 → v1.5.0
> **Author**: Claude Opus 4.5
> **Date**: 2026-02-01
> **Status**: Draft
> **Planning Doc**: [claude-code-exclusive-refactoring.plan.md](../01-plan/features/claude-code-exclusive-refactoring.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. **Gemini 코드 완전 제거**: 모든 Gemini 관련 코드, 파일, 참조 제거
2. **코드 단순화**: 플랫폼 분기 조건문 제거로 가독성 향상
3. **유지보수성 향상**: 단일 플랫폼 지원으로 테스트/유지보수 부담 감소
4. **기능 무손실**: 기존 Claude Code 기능 100% 유지

### 1.2 Design Principles

- **Surgical Removal**: 최소 범위 수정으로 Gemini 코드만 정확히 제거
- **No New Features**: 리팩토링 범위 외 기능 추가 금지
- **Test-Driven**: 각 수정 후 기능 검증 필수
- **Reversible**: 롤백 가능하도록 커밋 단위 분리

---

## 2. 삭제 대상 파일 목록 (Phase 1)

### 2.1 파일 삭제 명세

| # | 파일 경로 | 라인 수 | 삭제 명령 | 검증 명령 |
|---|----------|:------:|----------|----------|
| D-01 | `gemini-extension.json` | 100 | `rm gemini-extension.json` | `test ! -f gemini-extension.json` |
| D-02 | `GEMINI.md` | 311 | `rm GEMINI.md` | `test ! -f GEMINI.md` |
| D-03 | `debug-platform.js` | 11 | `rm debug-platform.js` | `test ! -f debug-platform.js` |
| D-04 | `lib/common.js.backup` | ~200 | `rm lib/common.js.backup` | `test ! -f lib/common.js.backup` |

### 2.2 디렉토리 삭제 명세

| # | 디렉토리 경로 | 파일 수 | 총 라인 | 삭제 명령 | 검증 명령 |
|---|-------------|:------:|:------:|----------|----------|
| DD-01 | `commands/gemini/` | 20 | ~1,943 | `rm -rf commands/gemini/` | `test ! -d commands/gemini/` |
| DD-02 | `lib/adapters/gemini/` | 0 | 0 | `rm -rf lib/adapters/gemini/` | `test ! -d lib/adapters/gemini/` |

### 2.3 삭제 대상 파일 상세

#### DD-01: commands/gemini/ (20개 TOML 파일)

```
commands/gemini/
├── archive.toml
├── github-stats.toml
├── init-dynamic.toml
├── init-enterprise.toml
├── init-starter.toml
├── learn-claude-code.toml
├── pdca-analyze.toml
├── pdca-design.toml
├── pdca-iterate.toml
├── pdca-next.toml
├── pdca-plan.toml
├── pdca-report.toml
├── pdca-status.toml
├── pipeline-next.toml
├── pipeline-start.toml
├── pipeline-status.toml
├── setup-claude-code.toml
├── upgrade-claude-code.toml
├── upgrade-level.toml
└── zero-script-qa.toml
```

---

## 3. 코드 수정 명세 (Phase 2: Core 모듈)

### 3.1 lib/core/platform.js

**파일 경로**: `/lib/core/platform.js`
**현재 라인 수**: 107
**예상 수정 라인**: ~25

#### M-01: Platform 타입 정의 수정 (Line 11)

**Before:**
```javascript
/**
 * @typedef {'claude' | 'gemini' | 'unknown'} Platform
 */
```

**After:**
```javascript
/**
 * @typedef {'claude' | 'unknown'} Platform
 */
```

#### M-02: detectPlatform() Gemini 분기 제거 (Lines 17-25)

**Before:**
```javascript
function detectPlatform() {
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY) {
    return 'gemini';
  }
  if (process.env.CLAUDE_PROJECT_DIR || process.env.ANTHROPIC_API_KEY) {
    return 'claude';
  }
  return 'unknown';
}
```

**After:**
```javascript
function detectPlatform() {
  if (process.env.CLAUDE_PROJECT_DIR || process.env.ANTHROPIC_API_KEY) {
    return 'claude';
  }
  return 'unknown';
}
```

#### M-03: isGeminiCli() 함수 삭제 (Lines 33-36)

**삭제할 코드:**
```javascript
/**
 * Gemini CLI 여부
 * @returns {boolean}
 */
function isGeminiCli() {
  return BKIT_PLATFORM === 'gemini';
}
```

#### M-04: PLUGIN_ROOT 조건 분기 제거 (Lines 50-52)

**Before:**
```javascript
const PLUGIN_ROOT = isGeminiCli()
  ? process.env.GEMINI_PLUGIN_ROOT || path.resolve(__dirname, '../..')
  : process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '../..');
```

**After:**
```javascript
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '../..');
```

#### M-05: PROJECT_DIR 조건 분기 제거 (Lines 58-60)

**Before:**
```javascript
const PROJECT_DIR = isGeminiCli()
  ? process.env.GEMINI_PROJECT_DIR || process.cwd()
  : process.env.CLAUDE_PROJECT_DIR || process.cwd();
```

**After:**
```javascript
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
```

#### M-06: module.exports에서 isGeminiCli 제거 (Line 98)

**Before:**
```javascript
module.exports = {
  detectPlatform,
  BKIT_PLATFORM,
  isGeminiCli,
  isClaudeCode,
  // ...
};
```

**After:**
```javascript
module.exports = {
  detectPlatform,
  BKIT_PLATFORM,
  isClaudeCode,
  // ...
};
```

---

### 3.2 lib/core/io.js

**파일 경로**: `/lib/core/io.js`
**현재 라인 수**: 164
**예상 수정 라인**: ~20

#### M-07: outputAllow() Gemini 분기 제거 (Lines 83-104)

**Before:**
```javascript
function outputAllow(context, hookEvent) {
  const { BKIT_PLATFORM } = getPlatform();
  const truncated = truncateContext(context);

  if (BKIT_PLATFORM === 'gemini') {
    console.log(JSON.stringify({
      status: 'allow',
      message: truncated || undefined,
    }));
  } else {
    if (hookEvent === 'SessionStart' || hookEvent === 'UserPromptSubmit') {
      console.log(JSON.stringify({
        success: true,
        message: truncated || undefined,
      }));
    } else {
      if (truncated) {
        console.log(truncated);
      }
    }
  }
}
```

**After:**
```javascript
function outputAllow(context, hookEvent) {
  const truncated = truncateContext(context);

  if (hookEvent === 'SessionStart' || hookEvent === 'UserPromptSubmit') {
    console.log(JSON.stringify({
      success: true,
      message: truncated || undefined,
    }));
  } else {
    if (truncated) {
      console.log(truncated);
    }
  }
}
```

#### M-08: outputBlock() Gemini 분기 제거 (Lines 109-125)

**Before:**
```javascript
function outputBlock(reason) {
  const { BKIT_PLATFORM } = getPlatform();

  if (BKIT_PLATFORM === 'gemini') {
    console.log(JSON.stringify({
      status: 'block',
      message: reason,
    }));
  } else {
    console.log(JSON.stringify({
      decision: 'block',
      reason: reason,
    }));
  }
  process.exit(0);
}
```

**After:**
```javascript
function outputBlock(reason) {
  console.log(JSON.stringify({
    decision: 'block',
    reason: reason,
  }));
  process.exit(0);
}
```

#### M-09: outputEmpty() Gemini 분기 제거 (Lines 129-136)

**Before:**
```javascript
function outputEmpty() {
  const { BKIT_PLATFORM } = getPlatform();

  if (BKIT_PLATFORM === 'gemini') {
    console.log(JSON.stringify({ status: 'allow' }));
  }
}
```

**After:**
```javascript
function outputEmpty() {
  // Claude Code는 빈 출력 시 아무것도 출력하지 않음
}
```

---

### 3.3 lib/core/debug.js

**파일 경로**: `/lib/core/debug.js`
**현재 라인 수**: 83
**예상 수정 라인**: ~5

#### M-10: getDebugLogPaths() Gemini 경로 제거 (Lines 23-30)

**Before:**
```javascript
function getDebugLogPaths() {
  const { BKIT_PLATFORM, PROJECT_DIR } = getPlatform();
  return {
    claude: path.join(PROJECT_DIR, '.claude', 'bkit-debug.log'),
    gemini: path.join(PROJECT_DIR, '.gemini', 'bkit-debug.log'),
    unknown: path.join(PROJECT_DIR, 'bkit-debug.log'),
  };
}
```

**After:**
```javascript
function getDebugLogPaths() {
  const { PROJECT_DIR } = getPlatform();
  return {
    claude: path.join(PROJECT_DIR, '.claude', 'bkit-debug.log'),
    unknown: path.join(PROJECT_DIR, 'bkit-debug.log'),
  };
}
```

#### M-11: DEBUG_LOG_PATHS 레거시 호환 수정 (Lines 71-76)

**Before:**
```javascript
const DEBUG_LOG_PATHS = {
  get claude() { return getDebugLogPaths().claude; },
  get gemini() { return getDebugLogPaths().gemini; },
  get unknown() { return getDebugLogPaths().unknown; },
};
```

**After:**
```javascript
const DEBUG_LOG_PATHS = {
  get claude() { return getDebugLogPaths().claude; },
  get unknown() { return getDebugLogPaths().unknown; },
};
```

---

### 3.4 lib/context-hierarchy.js

**파일 경로**: `/lib/context-hierarchy.js`
**현재 라인 수**: 282
**예상 수정 라인**: ~5

#### M-12: getUserConfigDir() Gemini 분기 제거 (Lines 45-52)

**Before:**
```javascript
function getUserConfigDir() {
  const common = getCommon();
  const homeDir = os.homedir();
  if (common.BKIT_PLATFORM === 'gemini') {
    return path.join(homeDir, '.gemini', 'bkit');
  }
  return path.join(homeDir, '.claude', 'bkit');
}
```

**After:**
```javascript
function getUserConfigDir() {
  const homeDir = os.homedir();
  return path.join(homeDir, '.claude', 'bkit');
}
```

---

### 3.5 hooks/session-start.js

**파일 경로**: `/hooks/session-start.js`
**현재 라인 수**: 658
**예상 수정 라인**: ~70

#### M-13: import 문에서 isGeminiCli 제거 (Lines 48-66)

**수정**: `isGeminiCli` import 제거

#### M-14: Gemini 강제 감지 블록 삭제 (Lines 104-115)

**삭제할 코드:**
```javascript
// Force-detect Gemini if gemini-extension.json exists (Fix for stale BKIT_PLATFORM)
try {
  const extensionJsonPath = path.join(__dirname, '../gemini-extension.json');
  if (BKIT_PLATFORM !== 'gemini' && fs.existsSync(extensionJsonPath) && !process.env.CLAUDE_PROJECT_DIR) {
    const oldPlatform = BKIT_PLATFORM;
    BKIT_PLATFORM = 'gemini';
    isGeminiCli = () => true;
    debugLog('SessionStart', 'Platform override', { from: oldPlatform, to: 'gemini' });
  }
} catch (e) {
  // Ignore detection errors
}
```

#### M-15: 환경변수 파일 경로 수정 (Lines 469-483)

**Before:**
```javascript
// Persist environment variables (cross-platform)
// Claude Code: CLAUDE_ENV_FILE, Gemini CLI: GEMINI_ENV_FILE
const envFile = process.env.CLAUDE_ENV_FILE || process.env.GEMINI_ENV_FILE;
if (envFile) {
  // ...
  fs.appendFileSync(envFile, `export BKIT_PLATFORM=${BKIT_PLATFORM}\n`);
}
```

**After:**
```javascript
// Persist environment variables (Claude Code only)
const envFile = process.env.CLAUDE_ENV_FILE;
if (envFile) {
  // ...
  fs.appendFileSync(envFile, `export BKIT_PLATFORM=claude\n`);
}
```

#### M-16: Gemini CLI 출력 블록 삭제 (Lines 493-536)

**삭제할 코드:**
```javascript
if (isGeminiCli()) {
  // ------------------------------------------------------------
  // Gemini CLI Output: Plain Text with ANSI Colors
  // ------------------------------------------------------------

  let output = `
\x1b[36m🤖 bkit Vibecoding Kit v1.4.7 (Gemini Edition)\x1b[0m
====================================================
PDCA Cycle & AI-Native Development Environment
`;
  // ... (전체 Gemini 출력 블록 약 44라인)

  console.log(output);
  process.exit(0);

} else {
```

**수정**: `if (isGeminiCli()) { ... } else {` 구조 제거, Claude Code 블록만 유지

---

## 4. 스크립트 수정 명세 (Phase 3)

### 4.1 수정 대상 스크립트 목록

| # | 파일 | 수정 라인 | 수정 내용 |
|---|------|:--------:|----------|
| S-01 | `scripts/gap-detector-stop.js` | 28, 344+ | isGeminiCli import 제거, 플랫폼 분기 제거 |
| S-02 | `scripts/iterator-stop.js` | 30, 317+ | isGeminiCli import 제거, 플랫폼 분기 제거 |
| S-03 | `scripts/pdca-skill-stop.js` | 25, 377+ | isGeminiCli import 제거, 플랫폼 분기 제거 |
| S-04 | `scripts/phase5-design-stop.js` | 91 | lib.isGeminiCli() 분기 제거 |
| S-05 | `scripts/phase6-ui-stop.js` | 111 | lib.isGeminiCli() 분기 제거 |
| S-06 | `scripts/phase9-deploy-stop.js` | 110 | lib.isGeminiCli() 분기 제거 |
| S-07 | `scripts/skill-post.js` | 164 | lib.isGeminiCli() 분기 제거 |
| S-08 | `scripts/learning-stop.js` | 79 | lib.isGeminiCli() 분기 제거 |

### 4.2 공통 수정 패턴

#### 패턴 A: import 문에서 isGeminiCli 제거

**Before:**
```javascript
const {
  readStdinSync,
  outputAllow,
  // ...
  isGeminiCli,
  // ...
} = require('../lib/common.js');
```

**After:**
```javascript
const {
  readStdinSync,
  outputAllow,
  // ...
  // isGeminiCli 제거됨
  // ...
} = require('../lib/common.js');
```

#### 패턴 B: 플랫폼 분기 if-else 제거

**Before:**
```javascript
if (isGeminiCli()) {
  // Gemini CLI: Plain text output
  let output = guidance.replace(/\*\*/g, '');
  output += `\n\n${taskGuidance}`;
  console.log(output);
  process.exit(0);
} else {
  // Claude Code: JSON output
  const response = {
    decision: 'allow',
    // ...
  };
  console.log(JSON.stringify(response));
  process.exit(0);
}
```

**After:**
```javascript
// Claude Code: JSON output
const response = {
  decision: 'allow',
  // ...
};
console.log(JSON.stringify(response));
process.exit(0);
```

#### 패턴 C: const isGemini = lib.isGeminiCli() 제거

**Before:**
```javascript
const isGemini = lib.isGeminiCli();
if (isGemini) {
  // Gemini 처리
} else {
  // Claude 처리
}
```

**After:**
```javascript
// Claude 처리 (분기 없이 직접 실행)
```

---

## 5. 문서 수정 명세 (Phase 4)

### 5.1 README.md 수정

**수정 내용:**
- "Claude Code & Gemini CLI" → "Claude Code 전용"
- Gemini 설치/설정 섹션 제거
- 플랫폼 호환성 표 업데이트

### 5.2 CHANGELOG.md 수정

**추가 내용:**
```markdown
## [1.5.0] - 2026-02-01

### Breaking Changes
- Gemini CLI 지원 제거 (별도 bkit-gemini 프로젝트로 분리 예정)
- `isGeminiCli()` 함수 제거
- `commands/gemini/` 디렉토리 제거

### Changed
- Claude Code 전용 플러그인으로 단순화
- 플랫폼 감지 로직 단순화
- 코드베이스 ~2,500 라인 감소
```

### 5.3 CUSTOMIZATION-GUIDE.md 수정

**수정 내용:**
- Gemini 관련 설정 가이드 제거
- Claude Code 전용 가이드로 업데이트

### 5.4 기타 문서

| 문서 | 조치 |
|------|------|
| `docs/.pdca-status.json` | gemini feature 참조 제거 |
| `bkit-system/README.md` | Gemini 언급 제거 |
| `bkit-system/components/hooks/_hooks-overview.md` | Gemini 언급 제거 |
| `bkit-system/components/scripts/_scripts-overview.md` | Gemini 언급 제거 |

---

## 6. lib/common.js 수정 명세

### 6.1 re-export에서 isGeminiCli 제거

**파일**: `/lib/common.js`

**Before:**
```javascript
module.exports = {
  // platform.js
  detectPlatform: platform.detectPlatform,
  BKIT_PLATFORM: platform.BKIT_PLATFORM,
  isGeminiCli: platform.isGeminiCli,
  isClaudeCode: platform.isClaudeCode,
  // ...
};
```

**After:**
```javascript
module.exports = {
  // platform.js
  detectPlatform: platform.detectPlatform,
  BKIT_PLATFORM: platform.BKIT_PLATFORM,
  isClaudeCode: platform.isClaudeCode,
  // ...
};
```

---

## 7. 검증 체크리스트

### 7.1 삭제 검증

```bash
# Gemini 파일 삭제 확인
test ! -f gemini-extension.json && echo "✅ gemini-extension.json 삭제됨"
test ! -f GEMINI.md && echo "✅ GEMINI.md 삭제됨"
test ! -d commands/gemini && echo "✅ commands/gemini/ 삭제됨"
test ! -d lib/adapters/gemini && echo "✅ lib/adapters/gemini/ 삭제됨"
test ! -f debug-platform.js && echo "✅ debug-platform.js 삭제됨"
test ! -f lib/common.js.backup && echo "✅ lib/common.js.backup 삭제됨"
```

### 7.2 코드 참조 검증

```bash
# Gemini 참조 검색 (docs/archive 제외)
grep -r "gemini" --include="*.js" --exclude-dir="docs/archive" . | wc -l
# 기대값: 0

# isGeminiCli 참조 검색
grep -r "isGeminiCli" . | wc -l
# 기대값: 0

# BKIT_PLATFORM === 'gemini' 검색
grep -r "BKIT_PLATFORM.*gemini" . | wc -l
# 기대값: 0
```

### 7.3 기능 테스트 체크리스트

| # | 테스트 항목 | 명령/동작 | 기대 결과 |
|---|-----------|----------|----------|
| T-01 | SessionStart Hook | Claude Code 세션 시작 | 온보딩 메시지 표시 |
| T-02 | PDCA Plan | `/pdca plan test-feature` | plan.md 생성 |
| T-03 | PDCA Design | `/pdca design test-feature` | design.md 생성 |
| T-04 | PDCA Analyze | `/pdca analyze test-feature` | analysis.md 생성 |
| T-05 | PDCA Status | `/pdca status` | 현재 상태 표시 |
| T-06 | Gap Detector | gap-detector Agent 실행 | Match Rate 계산 |
| T-07 | Iterator | pdca-iterator Agent 실행 | 자동 개선 |
| T-08 | Skill 호출 | `/starter`, `/dynamic` 등 | 정상 동작 |
| T-09 | Task 연동 | TaskCreate, TaskUpdate | 정상 연동 |
| T-10 | PreToolUse Hook | 파일 작업 시 | Hook 트리거 |

---

## 8. 롤백 계획

### 8.1 커밋 전략

```bash
# Phase 1: 파일 삭제 (커밋 1)
git add -A && git commit -m "chore: remove Gemini files (Phase 1)"

# Phase 2: Core 모듈 수정 (커밋 2)
git add lib/core/*.js lib/context-hierarchy.js lib/common.js
git commit -m "refactor: remove Gemini logic from core modules (Phase 2)"

# Phase 3: Hook/Scripts 수정 (커밋 3)
git add hooks/*.js scripts/*.js
git commit -m "refactor: remove Gemini branches from hooks/scripts (Phase 3)"

# Phase 4: 문서 수정 (커밋 4)
git add *.md docs/*.md bkit-system/*.md
git commit -m "docs: update for Claude Code exclusive (Phase 4)"
```

### 8.2 롤백 명령

```bash
# 특정 Phase 롤백
git revert HEAD~{N}..HEAD

# 전체 롤백 (브랜치 리셋)
git reset --hard origin/main
```

---

## 9. 구현 순서

### Phase 1: 파일 삭제 (Low Risk)

1. D-01 ~ D-04: 단일 파일 삭제
2. DD-01 ~ DD-02: 디렉토리 삭제
3. 검증: 파일 존재 여부 확인

### Phase 2: Core 모듈 수정 (Medium Risk)

1. M-01 ~ M-06: `lib/core/platform.js`
2. M-07 ~ M-09: `lib/core/io.js`
3. M-10 ~ M-11: `lib/core/debug.js`
4. M-12: `lib/context-hierarchy.js`
5. M-13 ~ M-16: `hooks/session-start.js`
6. 검증: 각 모듈 후 기능 테스트

### Phase 3: 스크립트 수정 (Medium Risk)

1. S-01 ~ S-08: 8개 스크립트 수정
2. 패턴 A, B, C 적용
3. 검증: grep으로 isGeminiCli 참조 확인

### Phase 4: 문서 수정 (Low Risk)

1. README.md, CHANGELOG.md 수정
2. 기타 문서 Gemini 언급 제거
3. 검증: grep으로 문서 내 gemini 언급 확인

### Phase 5: 최종 검증

1. 전체 grep 검색
2. 기능 테스트 체크리스트 수행
3. Gap Analysis 실행

---

## 10. 예상 결과

### 10.1 코드 감소량

| 항목 | 삭제 라인 | 비고 |
|------|:--------:|------|
| 파일 삭제 | ~2,565 | D-01~D-04, DD-01~DD-02 |
| 코드 수정 | ~150 | M-01~M-16, S-01~S-08 |
| **총 감소** | **~2,715** | |

### 10.2 복잡도 감소

| 항목 | Before | After | 감소율 |
|------|:------:|:-----:|:------:|
| 플랫폼 분기 조건문 | 26개 | 0개 | 100% |
| 플랫폼별 출력 포맷 | 2개 | 1개 | 50% |
| 지원 플랫폼 | 2개 | 1개 | 50% |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-01 | Initial draft with detailed modification specs | Claude Opus 4.5 |
