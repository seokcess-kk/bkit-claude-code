# Gemini Compatibility v1.4.8 Planning Document

> **Summary**: Claude Code 기능을 100% 유지하면서 Gemini CLI 호환성을 추가하는 크로스 플랫폼 지원 업그레이드
>
> **Project**: bkit (Vibecoding Kit)
> **Version**: 1.4.7 → 1.4.8
> **Author**: POPUP STUDIO
> **Date**: 2026-01-30
> **Status**: Draft (Review Required)

---

## 1. Overview

### 1.1 Purpose

bkit 플러그인이 Claude Code에서 완벽하게 동작하는 현재 기능을 **100% 유지**하면서, Gemini CLI에서도 핵심 기능이 작동하도록 **크로스 플랫폼 호환성**을 추가합니다.

### 1.2 Background

**현재 상황:**
- bkit v1.4.7은 Claude Code 전용으로 설계되어 완벽하게 작동
- gemini-extension.json과 GEMINI.md가 존재하지만 실제 Gemini CLI 스펙과 불일치
- 현재 Gemini CLI 호환성: 약 35% (hooks 15%, skills 55%, agents 10%)

**시장 동향 (2026년 1월 기준):**
- [skill-porter](https://github.com/jduncan-rva/skill-porter): Claude ↔ Gemini 양방향 변환 (~85% 코드 재사용)
- [gemini-cli-skillz](https://github.com/intellectronica/gemini-cli-skillz): MCP 기반 Claude 스킬 호환 레이어
- [ai-hooks-integration](https://github.com/runkids/ai-hooks-integration): 크로스 플랫폼 hooks 통합
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills): 200+ 멀티플랫폼 스킬 컬렉션

**GitHub 이슈:**
- [#17475](https://github.com/google-gemini/gemini-cli/issues/17475): Claude Code 플러그인 import 기능 요청
- [#15895](https://github.com/google-gemini/gemini-cli/issues/15895): Gemini Skills 아키텍처 호환성 문제 지적

### 1.3 Related Documents

- 분석 보고서: `docs/04-report/gemini-extensions-deep-research-2026-01.report.md`
- 기존 호환성 감사: `docs/04-report/gemini-cli-compatibility-audit.report.md`
- Gemini 심층 연구: `docs/04-report/99-deep-research-gemini-2026-01.md`

---

## 2. Scope

### 2.1 In Scope

- [x] **Phase 1**: gemini-extension.json 스키마 수정 (Gemini CLI 표준 준수)
- [x] **Phase 2**: Platform Adapter Layer 구현 (클린 아키텍처 핵심)
  - Base Adapter Class 정의
  - Claude Adapter 구현
  - Gemini Adapter 구현 (이벤트/도구/변수 매핑)
- [x] **Phase 3**: 기존 스크립트 어댑터 적용 (리팩토링)
- [x] **Phase 4**: Skills 단일 소스 검증 (추가 작업 없음)
- [x] **Phase 5**: Hooks 동적 생성 스크립트 (선택적, Gemini 테스트 후 결정)

### 2.2 Out of Scope

- Agents TOML 변환 (실험적 기능, 안정화 후 별도 버전에서 진행)
- Gemini CLI 전용 새 기능 개발
- Claude Code 기존 기능의 변경 또는 제거
- Task System Gemini 이식 (Gemini에 해당 기능 없음)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Claude Code 기존 기능 100% 유지 | **Critical** | Pending |
| FR-02 | gemini-extension.json Gemini CLI 표준 스키마 준수 | High | Pending |
| FR-03 | hooks/hooks.gemini.json BeforeTool/AfterTool 이벤트 지원 | High | Pending |
| FR-04 | Skills name/description frontmatter만 사용하는 Gemini 버전 | High | Pending |
| FR-05 | 플랫폼 자동 감지 (GEMINI_* vs CLAUDE_* 환경 변수) | Medium | Pending |
| FR-06 | 설치 스크립트 플랫폼별 분기 처리 | Medium | Pending |
| FR-07 | GEMINI.md Commands 호출이 정상 작동 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| 호환성 | Claude Code 100% 기능 유지 | 기존 테스트 케이스 통과 |
| 호환성 | Gemini CLI hooks 트리거 성공 | Gemini CLI 수동 테스트 |
| **유지보수성** | **설정 파일 2원 관리 금지** | hooks.json 단일 소스 |
| **유지보수성** | **비즈니스 로직 플랫폼 무관** | 어댑터 외부에 if/else 없음 |
| **유지보수성** | **클린 아키텍처 준수** | Platform Adapter 패턴 적용 |
| 확장성 | 새 플랫폼 추가 시 기존 코드 수정 없음 | 어댑터 파일 추가만으로 확장 |
| 코드 품질 | 코드 중복률 < 15% | 공유 로직 단일 소스 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] Claude Code에서 모든 기존 기능 정상 작동 확인
- [ ] Gemini CLI에서 extension 설치 및 로딩 성공
- [ ] Gemini CLI에서 hooks (BeforeTool/AfterTool) 트리거 확인
- [ ] Gemini CLI에서 Skills 활성화 및 사용 가능
- [ ] Gemini CLI에서 Commands 호출 가능
- [ ] 문서화 완료 (README 업데이트, 설치 가이드)

### 4.2 Quality Criteria

- [ ] Claude Code 기능 테스트 100% 통과
- [ ] Gemini CLI 기본 기능 테스트 통과
- [ ] 코드 중복 최소화 (공유 스크립트 활용)
- [ ] 플랫폼별 설정 파일 명확한 분리

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Claude Code 기능 손상 | **Critical** | Low | 기존 hooks.json 절대 수정 안함, 별도 파일 생성 |
| Gemini CLI 버전 변경으로 호환성 깨짐 | High | Medium | 최소 필드만 사용, 표준 스펙 준수 |
| Skills frontmatter 단순화로 기능 손실 | Medium | Medium | Claude용/Gemini용 별도 유지 또는 공통 하위집합만 사용 |
| 유지보수 복잡성 증가 | Medium | High | 빌드 자동화, 명확한 파일 명명 규칙 |
| Gemini Agents 실험적 기능 불안정 | Medium | High | v1.4.8에서는 Agents 변환 제외 |

---

## 6. Architecture Considerations

### 6.1 Design Principles (Clean Architecture)

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Single Source of Truth** | 설정 파일 2원 관리 금지 | hooks.json 하나만 유지, 런타임 변환 |
| **Dependency Inversion** | 비즈니스 로직이 플랫폼에 의존하지 않음 | Platform Adapter 추상화 |
| **Open/Closed** | 새 플랫폼 추가 시 기존 코드 수정 없음 | 어댑터 추가만으로 확장 |
| **Interface Segregation** | 플랫폼별 필요 기능만 구현 | 공통 인터페이스 정의 |

### 6.2 Clean Architecture Layer Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Business Logic (플랫폼 무관)                             │   │
│  │  - PDCA 워크플로우                                        │   │
│  │  - Gap Detection                                         │   │
│  │  - Report Generation                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                     Adapter Layer                               │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │  Claude Adapter      │  │  Gemini Adapter      │           │
│  │  - 환경변수 매핑      │  │  - 환경변수 매핑      │           │
│  │  - Hook 이벤트 변환   │  │  - Hook 이벤트 변환   │           │
│  │  - 도구명 변환        │  │  - 도구명 변환        │           │
│  │  - 경로 해결          │  │  - 경로 해결          │           │
│  └──────────────────────┘  └──────────────────────┘           │
├─────────────────────────────────────────────────────────────────┤
│                     Infrastructure Layer                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Platform Runtime (Claude Code CLI / Gemini CLI)         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 File Structure (Single Source)

```
bkit-claude-code/
├── .claude-plugin/
│   └── plugin.json              # Claude Code 매니페스트
├── gemini-extension.json        # Gemini CLI 매니페스트
│
├── hooks/
│   └── hooks.json               # ⭐ 단일 소스 (Claude 형식 기준)
│
├── skills/                      # ⭐ 단일 소스 (양쪽 공유)
│   └── */SKILL.md               # Gemini는 미지원 필드 무시
│
├── agents/                      # Claude Code 전용 (v1.4.8)
│   └── *.md
│
├── commands/
│   └── gemini/*.toml            # Gemini CLI Commands
│
├── scripts/
│   └── lib/
│       ├── platform/            # ⭐ 클린 아키텍처 핵심
│       │   ├── index.js         # PlatformAdapter 팩토리
│       │   ├── adapter.js       # 공통 인터페이스 (Base Class)
│       │   ├── claude.js        # Claude Code 어댑터
│       │   └── gemini.js        # Gemini CLI 어댑터
│       └── common.js            # 공유 유틸리티
│
└── templates/                   # 단일 소스
```

### 6.4 Platform Adapter Pattern

**핵심 아이디어**: hooks.json은 Claude Code 형식으로 단일 관리, 런타임에 어댑터가 플랫폼별로 변환

```javascript
// scripts/lib/platform/adapter.js (Base Class)
class PlatformAdapter {
  // 추상 메서드 - 각 플랫폼에서 구현
  get name() { throw new Error('Not implemented'); }
  get extensionRoot() { throw new Error('Not implemented'); }
  get projectDir() { throw new Error('Not implemented'); }

  // Hook 이벤트 변환
  translateHookEvent(event) { throw new Error('Not implemented'); }

  // 도구 이름 변환
  translateToolName(tool) { throw new Error('Not implemented'); }

  // 환경 변수 변환
  translateEnvVar(varName) { throw new Error('Not implemented'); }
}
```

```javascript
// scripts/lib/platform/claude.js
class ClaudeAdapter extends PlatformAdapter {
  get name() { return 'claude'; }
  get extensionRoot() { return process.env.CLAUDE_PLUGIN_ROOT; }
  get projectDir() { return process.env.CLAUDE_PROJECT_DIR; }

  translateHookEvent(event) {
    return event; // Claude는 원본 그대로
  }

  translateToolName(tool) {
    return tool; // Claude는 원본 그대로
  }
}
```

```javascript
// scripts/lib/platform/gemini.js
class GeminiAdapter extends PlatformAdapter {
  get name() { return 'gemini'; }
  get extensionRoot() { return process.env.GEMINI_EXTENSION_PATH; }
  get projectDir() { return process.env.GEMINI_PROJECT_DIR; }

  translateHookEvent(event) {
    const mapping = {
      'PreToolUse': 'BeforeTool',
      'PostToolUse': 'AfterTool',
      'UserPromptSubmit': 'BeforeAgent',
      'PreCompact': 'PreCompress',
      'Stop': 'AfterAgent'  // 유사 대체
    };
    return mapping[event] || event;
  }

  translateToolName(tool) {
    const mapping = {
      'Write': 'write_file',
      'Edit': 'edit_file',
      'Read': 'read_file',
      'Bash': 'run_shell_command',
      'Glob': 'find_files',
      'Grep': 'search_text'
    };
    return mapping[tool] || tool;
  }
}
```

```javascript
// scripts/lib/platform/index.js (Factory)
function createAdapter() {
  if (process.env.GEMINI_EXTENSION_PATH || process.env.GEMINI_PROJECT_DIR) {
    return new GeminiAdapter();
  }
  return new ClaudeAdapter(); // 기본값
}

module.exports = { createAdapter, PlatformAdapter, ClaudeAdapter, GeminiAdapter };
```

### 6.5 Benefits of Clean Architecture

| 이점 | 설명 |
|------|------|
| **단일 소스** | hooks.json 하나만 유지, 2원 관리 없음 |
| **유지보수 용이** | 플랫폼 로직이 어댑터에 캡슐화 |
| **확장성** | 새 플랫폼 (Cursor, Codex 등) 추가 시 어댑터만 생성 |
| **테스트 용이** | 어댑터 단위 테스트 가능 |
| **비즈니스 로직 분리** | PDCA 로직은 플랫폼 무관하게 작성 |

### 6.6 Migration Path for Future Platforms

```javascript
// 향후 Cursor 지원 추가 예시
class CursorAdapter extends PlatformAdapter {
  get name() { return 'cursor'; }
  translateHookEvent(event) { /* Cursor 매핑 */ }
  translateToolName(tool) { /* Cursor 매핑 */ }
}

// index.js에 추가
function createAdapter() {
  if (process.env.CURSOR_*) return new CursorAdapter();
  if (process.env.GEMINI_*) return new GeminiAdapter();
  return new ClaudeAdapter();
}
```

---

## 7. Implementation Plan

### 7.1 Phase 1: gemini-extension.json 수정 (우선순위 1)

**현재:**
```json
{
  "$schema": "...",
  "name": "bkit",
  "author": {...},
  "context": { "file": "GEMINI.md" },
  "hooks": {...},
  "skills": {...},
  ...
}
```

**목표:**
```json
{
  "name": "bkit",
  "version": "1.4.8",
  "description": "Vibecoding Kit - PDCA methodology + AI-native development",
  "contextFileName": "GEMINI.md"
}
```

**작업 내용:**
- 불필요한 필드 제거 ($schema, author, repository, license, keywords, engines)
- `context.file` → `contextFileName` 변경
- hooks/skills 인라인 정의 제거 (자동 감지 사용)

### 7.2 Phase 2: Platform Adapter Layer 구현 (핵심, 우선순위 1)

**목표**: 단일 hooks.json을 유지하면서 런타임에 플랫폼별 변환

**파일 구조:**
```
scripts/lib/platform/
├── index.js         # 팩토리 + 자동 감지
├── adapter.js       # Base Class (인터페이스 정의)
├── claude.js        # Claude Code 어댑터
└── gemini.js        # Gemini CLI 어댑터
```

**변환 매핑 (GeminiAdapter에 구현):**

| 카테고리 | Claude Code (원본) | Gemini CLI (변환) |
|----------|-------------------|-------------------|
| **Hook 이벤트** | | |
| | `SessionStart` | `SessionStart` |
| | `PreToolUse` | `BeforeTool` |
| | `PostToolUse` | `AfterTool` |
| | `Stop` | `AfterAgent` |
| | `UserPromptSubmit` | `BeforeAgent` |
| | `PreCompact` | `PreCompress` |
| **도구명** | | |
| | `Write` | `write_file` |
| | `Edit` | `edit_file` |
| | `Read` | `read_file` |
| | `Bash` | `run_shell_command` |
| | `Glob` | `find_files` |
| | `Grep` | `search_text` |
| | `Skill` | (제거 - Gemini 미지원) |
| **환경변수** | | |
| | `${CLAUDE_PLUGIN_ROOT}` | `${extensionPath}` |
| | `${CLAUDE_PROJECT_DIR}` | `${GEMINI_PROJECT_DIR}` |

**핵심 구현:**
```javascript
// scripts/lib/platform/index.js
const ClaudeAdapter = require('./claude');
const GeminiAdapter = require('./gemini');

function createAdapter() {
  // 환경 변수로 플랫폼 자동 감지
  if (process.env.GEMINI_EXTENSION_PATH || process.env.GEMINI_PROJECT_DIR) {
    return new GeminiAdapter();
  }
  return new ClaudeAdapter(); // 기본값 (기존 동작 보장)
}

// 전역 싱글톤
let _adapter = null;
function getAdapter() {
  if (!_adapter) _adapter = createAdapter();
  return _adapter;
}

module.exports = { createAdapter, getAdapter };
```

### 7.3 Phase 3: 기존 스크립트 어댑터 적용 (우선순위 2)

**목표**: 기존 스크립트에서 직접 환경변수 접근 → 어댑터 사용으로 리팩토링

**Before (기존 방식):**
```javascript
// scripts/pre-write.js
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
const projectDir = process.env.CLAUDE_PROJECT_DIR;
```

**After (클린 아키텍처):**
```javascript
// scripts/pre-write.js
const { getAdapter } = require('./lib/platform');
const adapter = getAdapter();

const pluginRoot = adapter.extensionRoot;
const projectDir = adapter.projectDir;
const platform = adapter.name; // 'claude' or 'gemini'
```

**수정 대상 스크립트:**
| 파일 | 변경 내용 |
|------|----------|
| `lib/common.js` | 어댑터 임포트, 플랫폼 정보 제공 |
| `hooks/session-start.js` | 어댑터 사용으로 경로 해결 |
| `scripts/pre-write.js` | 어댑터 사용 |
| `scripts/unified-write-post.js` | 어댑터 사용 |
| `scripts/unified-bash-pre.js` | 어댑터 사용 |
| `scripts/unified-bash-post.js` | 어댑터 사용 |
| `scripts/unified-stop.js` | 어댑터 사용 (Gemini: AfterAgent로 매핑) |

**비즈니스 로직 분리 원칙:**
```javascript
// ❌ 잘못된 예 (플랫폼 종속)
if (process.env.GEMINI_EXTENSION_PATH) {
  // Gemini 전용 로직
} else {
  // Claude 전용 로직
}

// ✅ 올바른 예 (어댑터 추상화)
const adapter = getAdapter();
const result = adapter.translateToolName(toolName);
// 비즈니스 로직은 플랫폼 무관하게 작성
```

### 7.4 Phase 4: Skills 단일 소스 전략 (우선순위 2)

**전략: 단일 skills/ 디렉토리 유지**

Gemini CLI는 지원하지 않는 frontmatter 필드를 **무시**하므로, 동일한 SKILL.md 파일을 양쪽 플랫폼에서 사용 가능합니다.

```
skills/
└── pdca/
    └── SKILL.md   # Claude: 전체 frontmatter 사용
                   # Gemini: name, description만 인식 (나머지 무시)
```

**검증된 패턴:**
- [gemini-cli-skillz](https://github.com/intellectronica/gemini-cli-skillz)에서 동일 방식 사용
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) 200+ 스킬 멀티플랫폼 공유

**추가 작업 없음**: 기존 skills/ 그대로 사용

### 7.5 Phase 5: Hooks 동적 생성 (Gemini 전용, 우선순위 3)

**목표**: 단일 hooks.json 유지, Gemini 설치 시 어댑터가 변환된 hooks 생성

**설치 흐름:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Claude Code 설치                                               │
│  └─ hooks/hooks.json 그대로 사용 (변환 없음)                     │
├─────────────────────────────────────────────────────────────────┤
│  Gemini CLI 설치                                                │
│  └─ gemini extensions install ...                              │
│      └─ Gemini는 hooks/hooks.json 자동 감지                     │
│          └─ 런타임에 어댑터가 이벤트명/도구명 변환               │
└─────────────────────────────────────────────────────────────────┘
```

**핵심**: 별도 hooks.gemini.json 파일 **불필요**

**Gemini hooks/hooks.json 동적 생성 스크립트 (선택적):**
```javascript
// scripts/generate-gemini-hooks.js
// Gemini CLI가 hooks.json 자체를 읽지 못하는 경우에만 사용
const { GeminiAdapter } = require('./lib/platform/gemini');
const fs = require('fs');

const claudeHooks = require('../hooks/hooks.json');
const adapter = new GeminiAdapter();

// Claude → Gemini 변환
const geminiHooks = transformHooks(claudeHooks, adapter);
fs.writeFileSync('hooks/hooks.json', JSON.stringify(geminiHooks, null, 2));
```

**실제 필요 여부**: Gemini CLI 테스트 후 결정
- Gemini가 Claude 형식 hooks.json을 읽을 수 있으면: 어댑터 런타임 변환만 사용
- Gemini가 자체 형식 필요하면: 설치 시 변환 스크립트 실행

---

## 8. Convention Prerequisites

### 8.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] `docs/01-plan/conventions.md` exists
- [x] ESLint configuration (`.eslintrc.*`)
- [x] TypeScript configuration (`tsconfig.json`)

### 8.2 New Conventions for v1.4.8

| Category | Convention | Example |
|----------|------------|---------|
| 파일 명명 | Gemini용 파일은 `.gemini` 접미사 | `hooks.gemini.json` |
| 디렉토리 | Gemini 전용은 `-gemini` 접미사 | `skills-gemini/` (선택적) |
| 환경 변수 | 플랫폼 감지 우선순위 | GEMINI_* > CLAUDE_* |
| 스크립트 | 플랫폼 독립적 출력 | stdout JSON, stderr 로그 |

---

## 9. Timeline & Milestones

| Phase | Task | Estimated | Dependency |
|-------|------|-----------|------------|
| 1 | gemini-extension.json 스키마 수정 | 1시간 | - |
| 2 | **Platform Adapter Layer 구현** | 4시간 | - |
| | ├─ adapter.js (Base Class) | 1시간 | |
| | ├─ claude.js (Claude Adapter) | 1시간 | |
| | ├─ gemini.js (Gemini Adapter) | 1.5시간 | |
| | └─ index.js (Factory) | 0.5시간 | |
| 3 | **기존 스크립트 어댑터 적용** | 3시간 | Phase 2 |
| | ├─ lib/common.js 리팩토링 | 1시간 | |
| | └─ hooks 스크립트 수정 (6개) | 2시간 | |
| 4 | Skills 호환성 검증 | 1시간 | - |
| 5 | Hooks 동적 생성 스크립트 (선택적) | 1시간 | Phase 2-3 |
| 6 | 테스트 (Claude Code) | 1시간 | Phase 1-5 |
| 7 | 테스트 (Gemini CLI) | 2시간 | Phase 1-5 |
| 8 | 문서화 | 2시간 | Phase 6-7 |
| **Total** | | **~15시간** | |

### 9.1 Critical Path

```
Phase 1 ──────────────────────────────────────────► Phase 6 (Claude 테스트)
         ↘                                       ↗
          Phase 2 ──► Phase 3 ──► Phase 5 ──────
                                              ↘
                      Phase 4 ─────────────────► Phase 7 (Gemini 테스트)
```

---

## 10. Next Steps

1. [ ] 이 Plan 문서 리뷰 및 승인
2. [ ] Design 문서 작성 (`/pdca design gemini-compatibility-v1.4.8`)
3. [ ] 구현 시작
4. [ ] Gap 분석 및 반복 개선
5. [ ] 완료 보고서 작성

---

## 11. Open Questions for Review

### 11.1 Platform Adapter 구현 언어

> **Q1**: Platform Adapter를 JavaScript로 구현할 것인가, TypeScript로 구현할 것인가?

**제안**: JavaScript (기존 scripts와 동일)
- 기존 bkit 스크립트가 모두 JavaScript
- 빌드 단계 없이 즉시 실행 가능
- TypeScript는 v1.5.0에서 전체 마이그레이션 시 고려

### 11.2 Agents 처리

> **Q2**: Agents를 v1.4.8에서 포함할 것인가, 향후 버전으로 미룰 것인가?

**제안**: v1.4.8에서 제외
- Gemini CLI Agents는 실험적 기능 (TOML 기반)
- 안정화 후 v1.5.0에서 AgentAdapter 추가
- Claude Code Agents는 현재 그대로 유지

### 11.3 Stop 이벤트 대체

> **Q3**: Claude Code의 `Stop` 이벤트를 Gemini에서 어떻게 대체할 것인가?

**제안**: `AfterAgent` 이벤트로 매핑 (GeminiAdapter에서 처리)
```javascript
translateHookEvent(event) {
  if (event === 'Stop') return 'AfterAgent';
  // ...
}
```
- 유사한 시점에 트리거
- 완벽한 1:1 대응은 아니지만 핵심 기능 커버 가능

### 11.4 Hooks 파일 처리 방식

> **Q4**: Gemini가 Claude 형식 hooks.json을 직접 읽을 수 있는지 테스트 필요

**시나리오 A**: Gemini가 hooks.json 직접 읽음 (이상적)
- 런타임에 어댑터가 이벤트명/도구명만 변환
- 추가 파일 생성 불필요

**시나리오 B**: Gemini가 자체 형식 필요
- 설치 시 `generate-gemini-hooks.js` 실행
- 변환된 hooks.json을 `~/.gemini/extensions/bkit/hooks/` 에 생성
- **원본 hooks.json은 수정하지 않음** (단일 소스 원칙 유지)

**결정 시점**: Gemini CLI 실제 테스트 후

### 11.5 향후 플랫폼 확장

> **Q5**: Cursor, Codex 등 다른 플랫폼 지원 계획은?

**제안**: v1.4.8은 Claude + Gemini만, 구조적 확장성 확보
- Platform Adapter 패턴으로 새 플랫폼 추가 용이
- 각 플랫폼 어댑터 파일만 추가하면 됨
- v1.5.0+에서 요청에 따라 추가

```javascript
// 향후 확장 예시 (v1.5.0+)
scripts/lib/platform/
├── adapter.js      # Base
├── claude.js       # v1.4.8
├── gemini.js       # v1.4.8
├── cursor.js       # v1.5.0+ (예정)
└── codex.js        # v1.5.0+ (예정)
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-30 | Initial draft based on market research | Claude Opus 4.5 |
| **0.2** | **2026-01-30** | **클린 아키텍처 기반으로 전면 재설계** | Claude Opus 4.5 |
| | | - 2원 관리 제거 → 단일 소스 원칙 | |
| | | - Platform Adapter 패턴 도입 | |
| | | - 비즈니스 로직 플랫폼 분리 | |

---

## Summary of v0.2 Changes (Clean Architecture)

### 핵심 변경사항

| Before (v0.1) | After (v0.2) |
|---------------|--------------|
| hooks.json + hooks.gemini.json 2원 관리 | **hooks.json 단일 소스 + 런타임 어댑터 변환** |
| 플랫폼별 if/else 분기 | **Platform Adapter 추상화** |
| skills/ + skills-gemini/ 분리 가능성 | **skills/ 단일 디렉토리 (Gemini는 미지원 필드 무시)** |
| 파일 복사/심볼릭 링크 | **런타임 변환, 파일 중복 없음** |

### 클린 아키텍처 적용

```
Application Layer   → PDCA 로직, Gap Detection (플랫폼 무관)
Adapter Layer       → ClaudeAdapter, GeminiAdapter (플랫폼 캡슐화)
Infrastructure      → Claude Code CLI, Gemini CLI (런타임)
```

---

**이 Plan 문서(v0.2)를 리뷰해주세요. 클린 아키텍처 기반으로 재설계되었습니다.**
