# Claude Code Exclusive Refactoring Planning Document

> **Summary**: bkit을 Claude Code 전용 플러그인으로 리팩토링하여 Gemini 관련 코드를 제거하고 Context Engineering 최적화
>
> **Project**: bkit (Vibecoding Kit)
> **Version**: v1.4.7 → v1.5.0
> **Author**: Claude Opus 4.5
> **Date**: 2026-02-01
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

bkit 플러그인을 **Claude Code 전용**으로 정리하여:

1. Gemini CLI 관련 코드 완전 제거 (약 2,500+ 라인)
2. Claude Code Context Engineering 최적화
3. 코드베이스 단순화 및 유지보수성 향상
4. 별도 `bkit-gemini` 프로젝트로 Gemini 지원 분리 준비

### 1.2 Background

#### bkit 철학 (3대 원칙)

| 철학 | 설명 | 구현 방식 |
|------|------|----------|
| **Automation First** | 사용자가 명령어를 몰라도 Claude가 자동으로 PDCA 적용 | `bkit-rules` 스킬 + Hook 시스템 |
| **No Guessing** | 불확실하면 문서 확인 → 없으면 사용자에게 질문 | 설계 우선 워크플로우 |
| **Docs = Code** | 설계 먼저, 구현은 나중 (설계-구현 동기화) | PDCA 워크플로우 + gap-detector |

#### 핵심 가치

```
bkit = Context Engineering의 실용적 구현체

"AI가 인간을 대체하는 것이 아니라,
 인간이 더 가치 있는 일에 집중하도록
 반복 작업과 품질 관리를 자동화"
```

#### 현재 상태

| 항목 | 수량 | 비고 |
|------|:----:|------|
| Skills | 21개 | 플랫폼 독립적 |
| Agents | 11개 | 플랫폼 독립적 |
| Hook Scripts | 39개 | **Gemini 분기 포함** |
| Library Functions | 132개 | **Gemini 로직 포함** |
| Templates | 23개 | 플랫폼 독립적 |

#### 왜 분리하는가?

1. **플랫폼 철학 차이**
   - Claude Code: 200K 토큰 + 자동 압축 + 심층 추론
   - Gemini CLI: 1M 토큰 + 빠른 실행 + Google 생태계

2. **Task System 근본적 차이**
   - Claude Code: 내장 도구 (`TaskCreate`, `TaskUpdate`)
   - Gemini CLI: MCP 서버로 구현 필요

3. **Hook 이벤트 불일치**
   - Claude만: `UserPromptSubmit`, `PreCompact`
   - Gemini만: `BeforeAgent`, `AfterAgent`

4. **유지보수 부담**
   - 모든 변경에 양쪽 테스트 필요
   - 조건 분기 복잡도 증가

### 1.3 Related Documents

- **bkit 철학**: `skills/bkit-rules/SKILL.md`
- **PDCA 워크플로우**: `skills/pdca/SKILL.md`
- **Context Engineering**: `CLAUDE.md`
- **Claude Code 공식 문서**: https://code.claude.com/docs

---

## 2. Scope

### 2.1 In Scope

- [x] Gemini 관련 파일 삭제 (3개 파일 + 2개 디렉토리)
- [x] Gemini 조건 분기 코드 제거 (lib/core 4개 파일)
- [x] Hook Scripts Gemini 분기 제거 (26개 스크립트)
- [x] 문서에서 Gemini 언급 제거/수정
- [x] 플랫폼 감지 로직 단순화
- [x] Claude Code Context Engineering 최적화
- [x] CLAUDE.md 개선

### 2.2 Out of Scope

- bkit-gemini 새 리포지토리 생성 (별도 프로젝트)
- 신규 기능 추가
- Skills/Agents 변경
- PDCA 로직 변경
- Templates 변경

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| **FR-01** | `gemini-extension.json` 파일 삭제 | High | Pending |
| **FR-02** | `GEMINI.md` 파일 삭제 | High | Pending |
| **FR-03** | `commands/gemini/` 디렉토리 삭제 (20개 TOML 파일) | High | Pending |
| **FR-04** | `lib/adapters/gemini/` 디렉토리 삭제 | High | Pending |
| **FR-05** | `lib/core/platform.js`에서 Gemini 로직 제거 | High | Pending |
| **FR-06** | `lib/core/io.js`에서 Gemini 출력 포맷 제거 | High | Pending |
| **FR-07** | `lib/core/debug.js`에서 Gemini 로그 경로 제거 | Medium | Pending |
| **FR-08** | `lib/context-hierarchy.js`에서 Gemini config 경로 제거 | Medium | Pending |
| **FR-09** | `hooks/session-start.js`에서 Gemini 감지/출력 제거 | High | Pending |
| **FR-10** | 26개 스크립트에서 `isGeminiCli()` 분기 제거 | High | Pending |
| **FR-11** | `README.md`에서 Gemini 언급 제거 | Medium | Pending |
| **FR-12** | `CHANGELOG.md` Gemini 항목 아카이브 | Low | Pending |
| **FR-13** | `debug-platform.js` 삭제 | Low | Pending |
| **FR-14** | `lib/common.js.backup` 삭제 | Low | Pending |
| **FR-15** | `.pdca-status.json`에서 platform 필드 단순화 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| **코드 감소** | 2,500+ 라인 제거 | git diff --stat |
| **복잡도 감소** | 조건 분기 50% 감소 | 코드 분석 |
| **유지보수성** | 플랫폼 분기 코드 0개 | grep 검색 |
| **하위 호환성** | 기존 기능 100% 유지 | 회귀 테스트 |
| **문서 정합성** | Gemini 언급 0개 | grep 검색 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] `grep -r "gemini" .` 결과 0건 (docs/archive 제외)
- [ ] `grep -r "isGeminiCli" .` 결과 0건
- [ ] 모든 PDCA 기능 정상 동작
- [ ] 모든 Skills/Agents 정상 동작
- [ ] README.md Claude Code 전용으로 업데이트
- [ ] 회귀 테스트 통과

### 4.2 Quality Criteria

- [ ] `/pdca plan test-feature` 정상 동작
- [ ] `/pdca design test-feature` 정상 동작
- [ ] `/pdca analyze test-feature` 정상 동작
- [ ] `/pdca iterate test-feature` 정상 동작
- [ ] `/pdca report test-feature` 정상 동작
- [ ] SessionStart hook 정상 동작
- [ ] PreToolUse/PostToolUse hook 정상 동작

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 숨겨진 Gemini 의존성 | High | Medium | grep 검색 철저히, 테스트 커버리지 |
| 기존 기능 손상 | High | Low | 단계별 제거, 각 단계 테스트 |
| 문서 누락 | Low | Medium | 문서 전체 grep 검색 |
| 백업 파일 누락 | Low | Low | find로 백업 파일 검색 |

---

## 6. Architecture Considerations

### 6.1 제거 대상 파일 목록

#### Phase 1: 파일 레벨 삭제 (Low Risk)

| 파일/디렉토리 | 라인 수 | 제거 방법 |
|--------------|:------:|----------|
| `gemini-extension.json` | 100 | 삭제 |
| `GEMINI.md` | 311 | 삭제 |
| `commands/gemini/` (20 files) | 1,943 | 디렉토리 삭제 |
| `lib/adapters/gemini/` | 0 | 디렉토리 삭제 |
| `debug-platform.js` | 11 | 삭제 |
| `lib/common.js.backup` | ~200 | 삭제 |
| **합계** | **~2,565** | |

#### Phase 2: 코드 레벨 수정 (Medium Risk)

| 파일 | 수정 라인 | 수정 내용 |
|------|:--------:|----------|
| `lib/core/platform.js` | ~25 | Gemini 타입/함수/조건 제거 |
| `lib/core/io.js` | ~15 | Gemini 출력 포맷 제거 |
| `lib/core/debug.js` | ~5 | Gemini 로그 경로 제거 |
| `lib/context-hierarchy.js` | ~5 | Gemini config 경로 제거 |
| `hooks/session-start.js` | ~50 | Gemini 감지/출력 블록 제거 |

#### Phase 3: 스크립트 수정 (Medium Risk)

다음 26개 스크립트에서 `isGeminiCli()` 분기 제거:

| 스크립트 | 수정 라인 |
|---------|:--------:|
| `scripts/gap-detector-stop.js` | ~5 |
| `scripts/iterator-stop.js` | ~5 |
| `scripts/pdca-skill-stop.js` | ~5 |
| `scripts/phase5-design-stop.js` | ~10 |
| `scripts/phase6-ui-stop.js` | ~10 |
| `scripts/phase9-deploy-stop.js` | ~10 |
| `scripts/skill-post.js` | ~5 |
| `scripts/pdca-post-write.js` | ~5 |
| `scripts/learning-stop.js` | ~3 |
| 기타 17개 스크립트 | ~50 |
| **합계** | **~108** |

#### Phase 4: 문서 수정 (Low Risk)

| 문서 | 수정 내용 |
|------|----------|
| `README.md` | Gemini 언급 제거, Claude Code 전용 표시 |
| `CHANGELOG.md` | Gemini 항목 아카이브 |
| `CUSTOMIZATION-GUIDE.md` | Gemini 언급 제거 |
| `docs/01-plan/features/dual-platform-refactoring.plan.md` | 아카이브 |

### 6.2 수정 후 구조

```
bkit-claude-code/
├── .claude-plugin/
│   └── plugin.json           # Claude Code 매니페스트 (유지)
├── CLAUDE.md                  # Context Engineering (최적화)
├── bkit.config.json           # 중앙 설정 (유지)
├── hooks/
│   ├── hooks.json             # Hook 정의 (유지)
│   └── session-start.js       # Claude 전용으로 단순화
├── lib/
│   ├── common.js              # 브릿지 (유지)
│   ├── core/
│   │   ├── platform.js        # Claude 전용으로 단순화
│   │   ├── io.js              # Claude 출력 포맷만
│   │   └── ...                # (유지)
│   ├── pdca/                  # (유지)
│   ├── intent/                # (유지)
│   └── task/                  # (유지)
├── skills/                    # 21개 (유지)
├── agents/                    # 11개 (유지)
├── scripts/                   # Gemini 분기 제거
└── templates/                 # 23개 (유지)
```

### 6.3 플랫폼 감지 단순화

**Before (lib/core/platform.js)**:
```javascript
/**
 * @typedef {'claude' | 'gemini' | 'unknown'} Platform
 */

function detectPlatform() {
  if (process.env.CLAUDE_CODE || process.env.CLAUDE_SESSION_ID) {
    return 'claude';
  }
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY) {
    return 'gemini';
  }
  return 'unknown';
}

function isGeminiCli() {
  return BKIT_PLATFORM === 'gemini';
}
```

**After**:
```javascript
/**
 * @typedef {'claude' | 'unknown'} Platform
 */

function detectPlatform() {
  if (process.env.CLAUDE_CODE || process.env.CLAUDE_SESSION_ID) {
    return 'claude';
  }
  return 'unknown';
}

// isGeminiCli() 함수 삭제
```

### 6.4 출력 포맷 단순화

**Before (lib/core/io.js)**:
```javascript
function outputAllow(message) {
  if (BKIT_PLATFORM === 'gemini') {
    console.log(JSON.stringify({ status: 'allow', message }));
  } else {
    console.log(JSON.stringify({ decision: 'allow', systemMessage: message }));
  }
}
```

**After**:
```javascript
function outputAllow(message) {
  console.log(JSON.stringify({ decision: 'allow', systemMessage: message }));
}
```

---

## 7. Claude Code Context Engineering 최적화

### 7.1 CLAUDE.md 개선 사항

조사에서 발견한 Claude Code 최신 패턴 적용:

| 패턴 | 현재 상태 | 개선 방향 |
|------|----------|----------|
| **Progressive Disclosure** | 일부 적용 | 참조 파일 분리 강화 |
| **3인칭 Description** | 혼재 | 모든 Skill description 3인칭으로 |
| **500줄 가이드라인** | 미적용 | 큰 SKILL.md 분리 |
| **Compact Instructions** | 없음 | PreCompact 보존 정보 명시 |

### 7.2 Hook 최적화

| Hook | 현재 | 최적화 |
|------|------|--------|
| `SessionStart` | Gemini 분기 포함 | Claude 전용 단순화 |
| `PreToolUse` | 플랫폼 조건문 | 조건문 제거 |
| `PostToolUse` | 플랫폼별 출력 | Claude 포맷만 |
| `Stop` | Unified handler | 유지 (Gemini 참조만 제거) |

### 7.3 3가지 Context 실패 모드 방지

| 실패 모드 | 방지 전략 |
|----------|----------|
| **Context Poisoning** | 환각 컨텍스트 진입 차단 (gap-detector 검증) |
| **Context Confusion** | 무관한 정보 최소화 (Progressive Disclosure) |
| **Context Clash** | 모순 정보 제거 (Gemini 관련 코드 완전 제거) |

---

## 8. Implementation Phases

### Phase 1: 파일 삭제 (Day 1)

| Task | 명령어 | 검증 |
|------|--------|------|
| T1.1 | `rm gemini-extension.json` | `ls gemini*` |
| T1.2 | `rm GEMINI.md` | `ls GEMINI*` |
| T1.3 | `rm -rf commands/gemini/` | `ls commands/` |
| T1.4 | `rm -rf lib/adapters/gemini/` | `ls lib/adapters/` |
| T1.5 | `rm debug-platform.js` | `ls debug*` |
| T1.6 | `rm lib/common.js.backup` | `ls lib/*.backup` |

### Phase 2: Core 모듈 수정 (Day 1-2)

| Task | 파일 | 수정 내용 |
|------|------|----------|
| T2.1 | `lib/core/platform.js` | `isGeminiCli()` 삭제, 타입 단순화 |
| T2.2 | `lib/core/io.js` | Gemini 출력 포맷 분기 삭제 |
| T2.3 | `lib/core/debug.js` | Gemini 로그 경로 삭제 |
| T2.4 | `lib/context-hierarchy.js` | Gemini config 경로 삭제 |
| T2.5 | `hooks/session-start.js` | Gemini 감지/출력 블록 삭제 |

### Phase 3: 스크립트 수정 (Day 2-3)

26개 스크립트에서 `isGeminiCli()` 분기 제거:

```bash
# 대상 파일 확인
grep -l "isGeminiCli\|gemini" scripts/*.js
```

### Phase 4: 문서 수정 (Day 3)

| Task | 파일 | 수정 내용 |
|------|------|----------|
| T4.1 | `README.md` | Gemini 언급 제거 |
| T4.2 | `CHANGELOG.md` | Gemini 항목 "Deprecated" 마킹 |
| T4.3 | `CUSTOMIZATION-GUIDE.md` | Gemini 언급 제거 |
| T4.4 | 기타 문서 | 아카이브 또는 수정 |

### Phase 5: 검증 및 테스트 (Day 4)

| Task | 검증 항목 | 명령어 |
|------|----------|--------|
| T5.1 | Gemini 참조 제거 확인 | `grep -r "gemini" . --include="*.js"` |
| T5.2 | isGeminiCli 제거 확인 | `grep -r "isGeminiCli" .` |
| T5.3 | PDCA 기능 테스트 | `/pdca plan`, `/pdca design`, etc. |
| T5.4 | Hook 동작 테스트 | SessionStart, PreToolUse, etc. |
| T5.5 | Skills 동작 테스트 | 각 Skill 호출 테스트 |

---

## 9. PDCA Sub-Tasks

```
┌────────────────────────────────────────────────────────────┐
│ [Plan] claude-code-exclusive-refactoring (본 문서)         │
│   ↓                                                        │
│ [Design] claude-code-exclusive-refactoring                 │
│   ├─ 상세 수정 목록                                         │
│   ├─ 롤백 계획                                              │
│   └─ 테스트 체크리스트                                       │
│   ↓                                                        │
│ [Do] claude-code-exclusive-refactoring                     │
│   ├─ Phase 1: 파일 삭제                                     │
│   ├─ Phase 2: Core 모듈 수정                                │
│   ├─ Phase 3: 스크립트 수정                                  │
│   └─ Phase 4: 문서 수정                                     │
│   ↓                                                        │
│ [Check] claude-code-exclusive-refactoring                  │
│   ├─ Gap Analysis (grep 검색)                               │
│   └─ 회귀 테스트                                            │
│   ↓                                                        │
│ [Report] claude-code-exclusive-refactoring                 │
│   └─ 완료 보고서                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 10. 제거 후 bkit 기능 요약

### 10.1 유지되는 핵심 기능

| 기능 | 설명 | 상태 |
|------|------|:----:|
| **PDCA Cycle** | plan → design → do → check → act → report → archive | ✅ |
| **Task Management** | TaskCreate, TaskUpdate 연동 | ✅ |
| **9-Phase Pipeline** | Schema → Convention → ... → Deployment | ✅ |
| **Level System** | Starter, Dynamic, Enterprise 자동 감지 | ✅ |
| **Language Tier** | Tier 1-4 언어 지원 수준 | ✅ |
| **Intent Detection** | 8개 언어 의도 감지 | ✅ |
| **Agent Auto-trigger** | 키워드 기반 자동 Agent 호출 | ✅ |
| **21 Skills** | 모든 Skill 유지 | ✅ |
| **11 Agents** | 모든 Agent 유지 | ✅ |
| **5-Layer Hook System** | 완전 유지 (Gemini 분기만 제거) | ✅ |
| **Context Engineering** | 메모리 계층, Fork, Hierarchy | ✅ |

### 10.2 제거되는 기능

| 기능 | 이유 | 대안 |
|------|------|------|
| Gemini CLI 지원 | 별도 프로젝트로 분리 | bkit-gemini |
| TOML 명령어 | Gemini 전용 | bkit-gemini |
| Gemini 출력 포맷 | 불필요 | - |
| 플랫폼 자동 감지 | Claude 전용 | - |

---

## 11. Next Steps

1. [ ] Design 문서 작성 (`/pdca design claude-code-exclusive-refactoring`)
2. [ ] Phase 1 실행 (파일 삭제)
3. [ ] Phase 2-3 실행 (코드 수정)
4. [ ] Phase 4 실행 (문서 수정)
5. [ ] Phase 5 실행 (검증 및 테스트)
6. [ ] Gap Analysis (`/pdca analyze claude-code-exclusive-refactoring`)
7. [ ] 완료 보고서 (`/pdca report claude-code-exclusive-refactoring`)

---

## Appendix A: Gemini 관련 코드 전체 목록

### A.1 삭제 대상 파일

```
gemini-extension.json                    # 100 lines
GEMINI.md                                # 311 lines
commands/gemini/archive.toml             # ~50 lines
commands/gemini/github-stats.toml        # ~50 lines
commands/gemini/init-dynamic.toml        # ~50 lines
commands/gemini/init-enterprise.toml     # ~50 lines
commands/gemini/init-starter.toml        # ~50 lines
commands/gemini/learn-claude-code.toml   # ~50 lines
commands/gemini/pdca-analyze.toml        # ~50 lines
commands/gemini/pdca-design.toml         # ~50 lines
commands/gemini/pdca-iterate.toml        # ~50 lines
commands/gemini/pdca-next.toml           # ~50 lines
commands/gemini/pdca-plan.toml           # ~50 lines
commands/gemini/pdca-report.toml         # ~50 lines
commands/gemini/pdca-status.toml         # ~50 lines
commands/gemini/pipeline-next.toml       # ~50 lines
commands/gemini/pipeline-start.toml      # ~50 lines
commands/gemini/pipeline-status.toml     # ~50 lines
commands/gemini/setup-claude-code.toml   # ~50 lines
commands/gemini/upgrade-claude-code.toml # ~50 lines
commands/gemini/upgrade-level.toml       # ~50 lines
commands/gemini/zero-script-qa.toml      # ~50 lines
lib/adapters/gemini/                     # Empty directory
debug-platform.js                        # 11 lines
lib/common.js.backup                     # ~200 lines
```

### A.2 수정 대상 파일

```
lib/core/platform.js      # Lines: 10, 18-19, 28, 34-36, 50-52, 58-60
lib/core/io.js            # Lines: 87-92, 114-117, 133-135
lib/core/debug.js         # Lines: 27, 74
lib/context-hierarchy.js  # Lines: 48-50
hooks/session-start.js    # Lines: 105-115, 470-472, 479, 493-536
scripts/gap-detector-stop.js
scripts/iterator-stop.js
scripts/pdca-skill-stop.js
scripts/phase5-design-stop.js
scripts/phase6-ui-stop.js
scripts/phase9-deploy-stop.js
scripts/skill-post.js
scripts/pdca-post-write.js
scripts/learning-stop.js
... (17 more scripts)
```

### A.3 Gemini 환경 변수 (제거 대상)

```bash
GEMINI_API_KEY
GOOGLE_AI_API_KEY
GEMINI_PROJECT_DIR
GEMINI_SESSION_ID
GEMINI_EXTENSION_PATH
GEMINI_PLUGIN_ROOT
GEMINI_ENV_FILE
```

---

## Appendix B: Claude Code 최신 기능 적용 계획

### B.1 Context Engineering 패턴

| 패턴 | 적용 여부 | 적용 방법 |
|------|:--------:|----------|
| Memory Hierarchy (3단계) | ✅ 적용 | User → Project → Dynamic |
| Progressive Disclosure | ✅ 적용 | Skill 참조 파일 분리 |
| 3가지 실패 모드 방지 | ✅ 적용 | Gemini 코드 완전 제거 |
| Compact Instructions | 🔄 예정 | CLAUDE.md 섹션 추가 |

### B.2 Hook 최신 기능

| 기능 | 적용 여부 | 적용 방법 |
|------|:--------:|----------|
| PreToolUse 입력 수정 | 🔄 예정 | 경로 자동 수정 Hook |
| Agent Hook | 🔄 예정 | 복잡한 검증에 활용 |
| Headless 모드 | ⏳ 미정 | CI/CD 통합 시 |

### B.3 Skills/Agents 표준

| 항목 | 현재 상태 | 개선 방향 |
|------|----------|----------|
| Gerund 네이밍 | 혼재 | 통일 (예: `processing-pdfs`) |
| 3인칭 Description | 혼재 | 모두 3인칭으로 |
| 500줄 가이드라인 | 일부 초과 | 분리 또는 압축 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-01 | Initial draft | Claude Opus 4.5 |
