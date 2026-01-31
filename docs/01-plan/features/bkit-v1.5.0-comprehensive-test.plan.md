# bkit v1.5.0 Comprehensive Test Plan

> **Version**: 1.0.0
> **Created**: 2026-02-01
> **Feature**: bkit-v1.5.0-comprehensive-test
> **Author**: Claude Code + bkit PDCA

---

## 1. Executive Summary

### 1.1 Background

bkit v1.5.0에서 Gemini CLI 관련 코드가 대규모로 제거되었습니다. 이 변경으로 인해 다음 파일들이 영향을 받았습니다:

| 변경 유형 | 파일 수 | 영향 범위 |
|----------|:-------:|----------|
| 파일 삭제 | 6+ | gemini-extension.json, GEMINI.md, commands/gemini/ 등 |
| 코드 수정 | 15+ | lib/core/*.js, hooks/session-start.js, scripts/*.js |
| 문서 수정 | 2 | README.md, CHANGELOG.md |

### 1.2 Test Objectives

1. **기능 무결성 검증**: 모든 bkit 기능이 v1.4.7과 동일하게 동작하는지 확인
2. **회귀 테스트**: Gemini 코드 제거로 인한 부작용 없음 확인
3. **설계 의도 검증**: 각 컴포넌트가 설계 문서대로 동작하는지 확인
4. **통합 테스트**: 컴포넌트 간 상호작용 검증

### 1.3 Success Criteria

| 기준 | 목표 | 비고 |
|------|:----:|------|
| Hook 테스트 통과율 | 100% | 9개 Hook 이벤트 |
| Skill 테스트 통과율 | 100% | 21개 Skill |
| Agent 테스트 통과율 | 100% | 11개 Agent |
| Script 테스트 통과율 | 100% | 39개 Script |
| lib/ 모듈 테스트 통과율 | 100% | 22개 모듈 |
| 통합 테스트 통과율 | 95%+ | PDCA Workflow |

---

## 2. Test Scope

### 2.1 In Scope

#### 2.1.1 Core Components (20,644 LOC)

| 카테고리 | 컴포넌트 수 | LOC | 테스트 방법 |
|----------|:----------:|:----:|------------|
| lib/core/ | 7 모듈 | 777 | Unit Test |
| lib/pdca/ | 5 모듈 | 1,434 | Unit + Integration |
| lib/intent/ | 4 모듈 | 643 | Unit Test |
| lib/task/ | 5 모듈 | 666 | Unit + Integration |
| lib/ (기타) | 5 모듈 | 1,942 | Unit Test |
| scripts/ | 39 스크립트 | 4,614 | Functional Test |
| agents/ | 11 에이전트 | 2,559 | Behavioral Test |
| skills/ | 21 스킬 | 8,009 | Functional Test |

#### 2.1.2 Hook System

| Hook Event | 테스트 항목 | 우선순위 |
|------------|------------|:--------:|
| SessionStart | 초기화, 상태 로드, 출력 포맷 | P0 |
| UserPromptSubmit | 의도 감지, 스킬 제안 | P0 |
| PreToolUse (Write\|Edit) | Context 검증, 권한 확인 | P0 |
| PreToolUse (Bash) | 명령어 검증, 의도 감지 | P0 |
| PostToolUse (Write) | PDCA 상태 업데이트 | P0 |
| PostToolUse (Bash) | 결과 캡처 | P1 |
| PostToolUse (Skill) | 스킬 결과 통합 | P0 |
| PreCompact | 상태 스냅샷 | P1 |
| Stop | 최종 상태 저장 | P0 |

#### 2.1.3 Context Engineering (FR-01 ~ FR-08)

| FR | 기능 | 테스트 모듈 |
|:--:|------|-----------|
| FR-01 | Multi-Level Context Hierarchy | lib/context-hierarchy.js |
| FR-02 | @import Directive | lib/import-resolver.js |
| FR-03 | Context Fork | lib/context-fork.js |
| FR-04 | UserPromptSubmit Hook | scripts/user-prompt-handler.js |
| FR-05 | Permission Hierarchy | lib/permission-manager.js |
| FR-06 | Task Dependency Chain | lib/task/tracker.js |
| FR-07 | Context Compaction Hook | scripts/context-compaction.js |
| FR-08 | MEMORY Variable | lib/memory-store.js |

### 2.2 Out of Scope

- Gemini CLI 관련 기능 (삭제됨)
- MCP 통합 테스트 (미구현)
- Performance 벤치마크 (별도 계획)

---

## 3. Test Strategy

### 3.1 Test Levels

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Test Pyramid                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                         ┌───────────┐                                   │
│                         │   E2E     │  PDCA Full Cycle                 │
│                         │  Tests    │  (5 scenarios)                    │
│                       ┌─┴───────────┴─┐                                 │
│                       │  Integration  │  Hook + Script + Agent          │
│                       │    Tests      │  (15 scenarios)                 │
│                     ┌─┴───────────────┴─┐                               │
│                     │   Functional      │  Skills, Agents               │
│                     │     Tests         │  (32 scenarios)               │
│                   ┌─┴───────────────────┴─┐                             │
│                   │      Unit Tests        │  lib/ modules              │
│                   │                        │  (100+ test cases)         │
│                   └────────────────────────┘                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Test Methods

| Level | 방법 | 도구 | 자동화 |
|-------|------|------|:------:|
| Unit | Node.js 직접 실행 | Jest (optional) | Yes |
| Functional | Claude Code 세션 내 실행 | Task System | Manual |
| Integration | Hook 체인 실행 | Bash + Node.js | Semi |
| E2E | 전체 PDCA 사이클 | Claude Code | Manual |

### 3.3 Test Environment

```
Platform: Claude Code v2.1.25+
Node.js: v18.0.0+
OS: macOS/Linux/Windows
Branch: feature/v1.4.8-features-cleanup (또는 main)
```

---

## 4. Detailed Test Cases

### 4.1 lib/core/ Module Tests (7 modules)

#### TC-CORE-001: platform.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-CORE-001-01 | detectPlatform() - Claude 환경 | CLAUDE_PROJECT_DIR 설정 | `'claude'` 반환 | P0 |
| TC-CORE-001-02 | detectPlatform() - Unknown 환경 | 환경변수 없음 | `'unknown'` 반환 | P0 |
| TC-CORE-001-03 | isClaudeCode() | Claude 환경 | `true` 반환 | P0 |
| TC-CORE-001-04 | isGeminiCli() 제거 확인 | - | 함수 존재하지 않음 | P0 |
| TC-CORE-001-05 | PLUGIN_ROOT | - | 유효한 경로 반환 | P0 |
| TC-CORE-001-06 | PROJECT_DIR | - | 유효한 경로 반환 | P0 |
| TC-CORE-001-07 | getPluginPath() | 상대 경로 | 절대 경로 반환 | P1 |
| TC-CORE-001-08 | getProjectPath() | 상대 경로 | 절대 경로 반환 | P1 |

#### TC-CORE-002: cache.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-CORE-002-01 | set() + get() | key, value | 값 저장/조회 | P0 |
| TC-CORE-002-02 | TTL 만료 | 5초 대기 후 조회 | undefined 반환 | P1 |
| TC-CORE-002-03 | invalidate() | key | 해당 키 삭제 | P1 |
| TC-CORE-002-04 | clear() | - | 전체 캐시 삭제 | P1 |

#### TC-CORE-003: io.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-CORE-003-01 | outputAllow() - SessionStart | context, 'SessionStart' | JSON 출력 | P0 |
| TC-CORE-003-02 | outputAllow() - PostToolUse | context, 'PostToolUse' | 텍스트 출력 | P0 |
| TC-CORE-003-03 | outputBlock() | reason | JSON + exit(0) | P0 |
| TC-CORE-003-04 | outputEmpty() | - | 출력 없음 | P0 |
| TC-CORE-003-05 | truncateContext() | 긴 문자열 | 50000자 이하 | P1 |
| TC-CORE-003-06 | parseHookInput() | JSON stdin | 파싱된 객체 | P0 |
| TC-CORE-003-07 | Gemini 출력 포맷 제거 확인 | - | Claude 포맷만 존재 | P0 |

#### TC-CORE-004: debug.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-CORE-004-01 | getDebugLogPath() - Claude | - | .claude/bkit-debug.log | P1 |
| TC-CORE-004-02 | getDebugLogPath() - Unknown | - | bkit-debug.log | P1 |
| TC-CORE-004-03 | debugLog() | module, message | 파일에 기록 | P1 |
| TC-CORE-004-04 | Gemini 로그 경로 제거 확인 | - | gemini 키 없음 | P0 |

#### TC-CORE-005: config.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-CORE-005-01 | loadConfig() | 유효한 경로 | 설정 객체 | P0 |
| TC-CORE-005-02 | getConfig() | 점 표기법 키 | 중첩 값 반환 | P0 |
| TC-CORE-005-03 | getConfigArray() | 배열 키 | 배열 반환 | P1 |
| TC-CORE-005-04 | getBkitConfig() | - | bkit.config.json 로드 | P0 |
| TC-CORE-005-05 | safeJsonParse() | 유효한 JSON | 파싱된 객체 | P0 |
| TC-CORE-005-06 | safeJsonParse() | 잘못된 JSON | 기본값 반환 | P1 |

#### TC-CORE-006: file.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-CORE-006-01 | isSourceFile() | .js 파일 | true | P0 |
| TC-CORE-006-02 | isSourceFile() | .md 파일 | false | P0 |
| TC-CORE-006-03 | isCodeFile() | .ts 파일 | true | P0 |
| TC-CORE-006-04 | isUiFile() | .tsx 파일 | true | P1 |
| TC-CORE-006-05 | isEnvFile() | .env 파일 | true | P1 |
| TC-CORE-006-06 | extractFeature() | 파일 경로 | feature 이름 | P1 |

#### TC-CORE-007: index.js (Entry Point)

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-CORE-007-01 | 모든 export 확인 | - | 39개 export | P0 |
| TC-CORE-007-02 | isGeminiCli export 제거 확인 | - | export 없음 | P0 |

---

### 4.2 lib/pdca/ Module Tests (5 modules)

#### TC-PDCA-001: status.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-PDCA-001-01 | getPdcaStatusPath() | - | docs/.pdca-status.json | P0 |
| TC-PDCA-001-02 | createInitialStatusV2() | - | v2.0 스키마 객체 | P0 |
| TC-PDCA-001-03 | loadPdcaStatus() | 파일 존재 | 상태 객체 | P0 |
| TC-PDCA-001-04 | loadPdcaStatus() | 파일 없음 | 초기 상태 생성 | P0 |
| TC-PDCA-001-05 | savePdcaStatus() | 상태 객체 | 파일 저장 | P0 |
| TC-PDCA-001-06 | getFeatureStatus() | feature 이름 | 피처 상태 | P0 |
| TC-PDCA-001-07 | updatePdcaStatus() | phase, feature | 상태 업데이트 | P0 |
| TC-PDCA-001-08 | addPdcaHistory() | 히스토리 항목 | 배열에 추가 | P1 |
| TC-PDCA-001-09 | setActiveFeature() | feature 이름 | primaryFeature 설정 | P0 |
| TC-PDCA-001-10 | getActiveFeatures() | - | 활성 피처 배열 | P0 |
| TC-PDCA-001-11 | migrateStatusToV2() | v1.0 상태 | v2.0 변환 | P1 |

#### TC-PDCA-002: phase.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-PDCA-002-01 | getPhaseNumber() | 'plan' | 1 | P0 |
| TC-PDCA-002-02 | getPhaseName() | 3 | 'do' | P0 |
| TC-PDCA-002-03 | getNextPdcaPhase() | 'plan' | 'design' | P0 |
| TC-PDCA-002-04 | getPreviousPdcaPhase() | 'design' | 'plan' | P1 |
| TC-PDCA-002-05 | findDesignDoc() | feature | 경로 또는 null | P0 |
| TC-PDCA-002-06 | findPlanDoc() | feature | 경로 또는 null | P0 |
| TC-PDCA-002-07 | checkPhaseDeliverables() | phase, feature | 체크 결과 | P1 |
| TC-PDCA-002-08 | validatePdcaTransition() | from, to | 유효성 결과 | P1 |

#### TC-PDCA-003: level.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-PDCA-003-01 | detectLevel() | 프로젝트 경로 | 'Starter'/'Dynamic'/'Enterprise' | P0 |
| TC-PDCA-003-02 | canSkipPhase() | level, phase | boolean | P1 |
| TC-PDCA-003-03 | getRequiredPhases() | level | phase 배열 | P1 |
| TC-PDCA-003-04 | getNextPhaseForLevel() | level, current | 다음 phase | P1 |

#### TC-PDCA-004: tier.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-PDCA-004-01 | getLanguageTier() | '.ts' | 1 | P1 |
| TC-PDCA-004-02 | getLanguageTier() | '.go' | 2 | P1 |
| TC-PDCA-004-03 | getTierDescription() | 1 | 'AI-Native Essential' | P1 |
| TC-PDCA-004-04 | isTier1() | '.py' | true | P1 |

#### TC-PDCA-005: automation.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-PDCA-005-01 | getAutomationLevel() | - | 'manual'/'semi-auto'/'full-auto' | P1 |
| TC-PDCA-005-02 | shouldAutoAdvance() | matchRate, level | boolean | P1 |
| TC-PDCA-005-03 | generateAutoTrigger() | phase | 트리거 객체 | P1 |
| TC-PDCA-005-04 | shouldAutoStartPdca() | taskSize | boolean | P1 |

---

### 4.3 lib/intent/ Module Tests (4 modules)

#### TC-INTENT-001: language.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-INTENT-001-01 | detectLanguage() | '안녕하세요' | 'ko' | P0 |
| TC-INTENT-001-02 | detectLanguage() | 'Hello' | 'en' | P0 |
| TC-INTENT-001-03 | detectLanguage() | 'こんにちは' | 'ja' | P1 |
| TC-INTENT-001-04 | getAllPatterns() | 'gap-detector' | 8개 언어 패턴 | P0 |

#### TC-INTENT-002: trigger.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-INTENT-002-01 | matchImplicitAgentTrigger() | '검증해줘' | 'bkit:gap-detector' | P0 |
| TC-INTENT-002-02 | matchImplicitAgentTrigger() | '개선해줘' | 'bkit:pdca-iterator' | P0 |
| TC-INTENT-002-03 | matchImplicitSkillTrigger() | 'plan 작성' | 'pdca' | P0 |
| TC-INTENT-002-04 | detectNewFeatureIntent() | '새 기능 추가' | { detected: true, ... } | P1 |
| TC-INTENT-002-05 | extractFeatureNameFromRequest() | 'user-auth 기능' | 'user-auth' | P1 |

#### TC-INTENT-003: ambiguity.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-INTENT-003-01 | calculateAmbiguityScore() | 명확한 요청 | < 50 | P1 |
| TC-INTENT-003-02 | calculateAmbiguityScore() | 모호한 요청 | >= 50 | P1 |
| TC-INTENT-003-03 | generateClarifyingQuestions() | 모호한 요청 | 질문 배열 | P1 |
| TC-INTENT-003-04 | containsFilePath() | '/path/to/file.js' | true | P1 |
| TC-INTENT-003-05 | containsTechnicalTerms() | 'API endpoint' | true | P1 |

---

### 4.4 lib/task/ Module Tests (5 modules)

#### TC-TASK-001: classification.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-TASK-001-01 | classifyTask() | 5줄 변경 | 'trivial' | P0 |
| TC-TASK-001-02 | classifyTask() | 30줄 변경 | 'minor' | P0 |
| TC-TASK-001-03 | classifyTask() | 150줄 변경 | 'feature' | P0 |
| TC-TASK-001-04 | classifyTask() | 300줄 변경 | 'major' | P0 |
| TC-TASK-001-05 | getPdcaGuidance() | 'feature' | PDCA 권장 | P1 |

#### TC-TASK-002: context.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-TASK-002-01 | setActiveSkill() | skill 이름 | 저장 | P1 |
| TC-TASK-002-02 | getActiveSkill() | - | skill 이름 | P1 |
| TC-TASK-002-03 | setActiveAgent() | agent 이름 | 저장 | P1 |
| TC-TASK-002-04 | getActiveAgent() | - | agent 이름 | P1 |
| TC-TASK-002-05 | clearActiveContext() | - | 초기화 | P1 |

#### TC-TASK-003: creator.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-TASK-003-01 | generatePdcaTaskSubject() | phase, feature | '[Phase] feature' | P0 |
| TC-TASK-003-02 | generatePdcaTaskDescription() | phase, feature | 상세 설명 | P0 |
| TC-TASK-003-03 | getPdcaTaskMetadata() | phase, feature | 메타데이터 객체 | P0 |
| TC-TASK-003-04 | createPdcaTaskChain() | feature | Task 체인 | P1 |

#### TC-TASK-004: tracker.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-TASK-004-01 | savePdcaTaskId() | phase, taskId | 저장 | P0 |
| TC-TASK-004-02 | getPdcaTaskId() | phase | taskId | P0 |
| TC-TASK-004-03 | getTaskChainStatus() | feature | 체인 상태 | P1 |
| TC-TASK-004-04 | updatePdcaTaskStatus() | taskId, status | 업데이트 | P0 |
| TC-TASK-004-05 | triggerNextPdcaAction() | matchRate | 다음 액션 | P0 |

---

### 4.5 Context Engineering Module Tests

#### TC-CE-001: context-hierarchy.js (FR-01)

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-CE-001-01 | getContextHierarchy() | - | 4-레벨 병합 객체 | P0 |
| TC-CE-001-02 | getHierarchicalConfig() | 'pdca.threshold' | 설정 값 | P0 |
| TC-CE-001-03 | setSessionContext() | key, value | 세션 저장 | P0 |
| TC-CE-001-04 | getUserConfigDir() | - | ~/.claude/bkit | P0 |
| TC-CE-001-05 | 충돌 감지 | 동일 키 다른 값 | 충돌 기록 | P1 |
| TC-CE-001-06 | Gemini config 경로 제거 확인 | - | gemini 경로 없음 | P0 |

#### TC-CE-002: import-resolver.js (FR-02)

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-CE-002-01 | resolveImports() | SKILL.md with imports | 내용 삽입 | P0 |
| TC-CE-002-02 | 변수 치환 | ${PLUGIN_ROOT} | 실제 경로 | P0 |
| TC-CE-002-03 | 상대 경로 해석 | ./relative/path.md | 절대 경로 | P0 |
| TC-CE-002-04 | 순환 import 감지 | A→B→A | 스킵 + 경고 | P1 |
| TC-CE-002-05 | 파일 없음 처리 | /nonexistent.md | 빈 문자열 | P1 |

#### TC-CE-003: context-fork.js (FR-03)

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-CE-003-01 | forkContext() | skill 이름 | { forkId, context } | P0 |
| TC-CE-003-02 | 격리 확인 | fork 내 수정 | 부모 영향 없음 | P0 |
| TC-CE-003-03 | mergeForkedContext() | forkId | 선택적 병합 | P0 |
| TC-CE-003-04 | discardFork() | forkId | 포크 삭제 | P1 |
| TC-CE-003-05 | getActiveForks() | - | 활성 포크 배열 | P1 |

#### TC-CE-004: permission-manager.js (FR-05)

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-CE-004-01 | checkPermission() | 'Write', input | 'allow' | P0 |
| TC-CE-004-02 | checkPermission() | 'Bash', 'rm -rf /' | 'deny' | P0 |
| TC-CE-004-03 | checkPermission() | 'Bash', 'rm -r temp' | 'ask' | P0 |
| TC-CE-004-04 | 패턴 매칭 | glob 패턴 | 정규식 변환 | P1 |
| TC-CE-004-05 | 우선순위 | 긴 패턴 | 먼저 확인 | P1 |

#### TC-CE-005: memory-store.js (FR-08)

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-CE-005-01 | setMemory() + getMemory() | key, value | 저장/조회 | P0 |
| TC-CE-005-02 | updateMemory() | 부분 객체 | 병합 | P0 |
| TC-CE-005-03 | 파일 동기화 | setMemory() | .bkit-memory.json 업데이트 | P0 |
| TC-CE-005-04 | deleteMemory() | key | 키 삭제 | P1 |
| TC-CE-005-05 | clearMemory() | - | 전체 삭제 | P1 |

---

### 4.6 Hook Script Tests (9 hooks)

#### TC-HOOK-001: session-start.js

| ID | 테스트 항목 | 기대 결과 | 우선순위 |
|:--:|------------|----------|:--------:|
| TC-HOOK-001-01 | 정상 실행 | JSON 출력 (success: true) | P0 |
| TC-HOOK-001-02 | PDCA 상태 로드 | 이전 상태 복원 | P0 |
| TC-HOOK-001-03 | AskUserQuestion 출력 | 4개 옵션 표시 | P0 |
| TC-HOOK-001-04 | additionalContext | 트리거 테이블 포함 | P0 |
| TC-HOOK-001-05 | Gemini 출력 제거 확인 | Gemini CLI 관련 텍스트 없음 | P0 |
| TC-HOOK-001-06 | isGeminiCli import 제거 확인 | import 없음 | P0 |

#### TC-HOOK-002: user-prompt-handler.js (FR-04)

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-HOOK-002-01 | 의도 감지 | '새 기능 추가' | feature intent 감지 | P0 |
| TC-HOOK-002-02 | 에이전트 트리거 | '검증해줘' | gap-detector 제안 | P0 |
| TC-HOOK-002-03 | 스킬 트리거 | 'plan 작성' | pdca 스킬 제안 | P0 |
| TC-HOOK-002-04 | 모호성 점수 | 모호한 요청 | score >= 50 | P1 |

#### TC-HOOK-003: pre-write.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-HOOK-003-01 | 정상 실행 | Write 도구 | 허용 | P0 |
| TC-HOOK-003-02 | 설계 문서 확인 | 새 파일 작성 | 설계 문서 제안 | P1 |
| TC-HOOK-003-03 | 권한 확인 | - | permission-manager 호출 | P1 |

#### TC-HOOK-004: unified-bash-pre.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-HOOK-004-01 | 정상 명령 | 'git status' | 허용 | P0 |
| TC-HOOK-004-02 | 차단 명령 | 'rm -rf /' | 차단 | P0 |
| TC-HOOK-004-03 | 확인 필요 | 'git push --force' | 경고 컨텍스트 | P0 |

#### TC-HOOK-005: unified-write-post.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-HOOK-005-01 | PDCA 상태 업데이트 | 파일 쓰기 | 상태 업데이트 | P0 |
| TC-HOOK-005-02 | 피처 추출 | docs/01-plan/features/x.plan.md | 'x' 추출 | P0 |
| TC-HOOK-005-03 | 히스토리 기록 | - | history 배열 추가 | P1 |

#### TC-HOOK-006: unified-bash-post.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-HOOK-006-01 | 결과 캡처 | Bash 실행 후 | 결과 로깅 | P1 |

#### TC-HOOK-007: skill-post.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-HOOK-007-01 | 스킬 결과 통합 | Skill 실행 후 | 다음 단계 제안 | P0 |
| TC-HOOK-007-02 | PDCA 상태 업데이트 | pdca-phase 있는 스킬 | phase 업데이트 | P0 |
| TC-HOOK-007-03 | isGeminiCli 제거 확인 | - | 조건문 없음 | P0 |

#### TC-HOOK-008: context-compaction.js (FR-07)

| ID | 테스트 항목 | 기대 결과 | 우선순위 |
|:--:|------------|----------|:--------:|
| TC-HOOK-008-01 | 상태 스냅샷 | .pdca-snapshots/ 저장 | P0 |
| TC-HOOK-008-02 | 자동 정리 | 10개 초과 시 오래된 것 삭제 | P1 |
| TC-HOOK-008-03 | 요약 출력 | 컨텍스트 복원용 요약 | P0 |

#### TC-HOOK-009: unified-stop.js

| ID | 테스트 항목 | 기대 결과 | 우선순위 |
|:--:|------------|----------|:--------:|
| TC-HOOK-009-01 | 최종 상태 저장 | .pdca-status.json 업데이트 | P0 |
| TC-HOOK-009-02 | 메모리 유지 | .bkit-memory.json 업데이트 | P0 |
| TC-HOOK-009-03 | 14개 핸들러 라우팅 | 스킬/에이전트별 처리 | P0 |
| TC-HOOK-009-04 | isGeminiCli 제거 확인 | - | 조건문 없음 | P0 |

---

### 4.7 PDCA Stop Script Tests (15 scripts)

#### TC-STOP-001: gap-detector-stop.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-STOP-001-01 | matchRate >= 90% | 분석 결과 | report 제안 | P0 |
| TC-STOP-001-02 | matchRate < 90% | 분석 결과 | iterate 제안 | P0 |
| TC-STOP-001-03 | Task 자동 생성 | - | [Check] Task | P0 |
| TC-STOP-001-04 | isGeminiCli 제거 확인 | - | 조건문 없음 | P0 |

#### TC-STOP-002: iterator-stop.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-STOP-002-01 | 반복 완료 | matchRate >= 90% | report 제안 | P0 |
| TC-STOP-002-02 | 반복 계속 | matchRate < 90% | 재분석 제안 | P0 |
| TC-STOP-002-03 | 최대 반복 | iterationCount >= 5 | 강제 완료 | P0 |
| TC-STOP-002-04 | isGeminiCli 제거 확인 | - | 조건문 없음 | P0 |

#### TC-STOP-003: pdca-skill-stop.js

| ID | 테스트 항목 | 입력 | 기대 결과 | 우선순위 |
|:--:|------------|------|----------|:--------:|
| TC-STOP-003-01 | Task 체인 생성 | /pdca plan | [Plan] Task | P0 |
| TC-STOP-003-02 | 다음 단계 제안 | phase 완료 | 다음 phase 제안 | P0 |
| TC-STOP-003-03 | isGeminiCli 제거 확인 | - | 조건문 없음 | P0 |

#### TC-STOP-004 ~ TC-STOP-012: Phase Scripts (9개)

| 스크립트 | 테스트 항목 | 우선순위 |
|---------|------------|:--------:|
| phase1-schema-stop.js | 스키마 검증 후 저장 | P1 |
| phase2-convention-stop.js | 컨벤션 검증 후 저장 | P1 |
| phase3-mockup-stop.js | 목업 완성 확인 | P1 |
| phase4-api-stop.js | API 설계 완료 검증 | P1 |
| phase5-design-stop.js | 설계 완료 저장 | P1 |
| phase6-ui-stop.js | UI 통합 완료 | P1 |
| phase7-seo-stop.js | 보안/SEO 검증 | P1 |
| phase8-review-stop.js | 리뷰 완료 체크 | P1 |
| phase9-deploy-stop.js | 배포 완료 기록 | P1 |

모든 phase 스크립트에서 **isGeminiCli 제거 확인** 필수 (P0)

---

### 4.8 Skill Functional Tests (21 skills)

#### TC-SKILL-001: pdca Skill

| ID | 테스트 항목 | 명령어 | 기대 결과 | 우선순위 |
|:--:|------------|--------|----------|:--------:|
| TC-SKILL-001-01 | plan 액션 | `/pdca plan test-feature` | Plan 문서 생성 | P0 |
| TC-SKILL-001-02 | design 액션 | `/pdca design test-feature` | Design 문서 생성 | P0 |
| TC-SKILL-001-03 | do 액션 | `/pdca do test-feature` | 구현 가이드 | P0 |
| TC-SKILL-001-04 | analyze 액션 | `/pdca analyze test-feature` | Gap 분석 | P0 |
| TC-SKILL-001-05 | iterate 액션 | `/pdca iterate test-feature` | 자동 개선 | P0 |
| TC-SKILL-001-06 | report 액션 | `/pdca report test-feature` | 보고서 생성 | P0 |
| TC-SKILL-001-07 | status 액션 | `/pdca status` | 상태 표시 | P0 |
| TC-SKILL-001-08 | next 액션 | `/pdca next` | 다음 단계 제안 | P0 |
| TC-SKILL-001-09 | archive 액션 | `/pdca archive test-feature` | 문서 아카이브 | P1 |
| TC-SKILL-001-10 | cleanup 액션 | `/pdca cleanup` | 아카이브 정리 | P1 |

#### TC-SKILL-002 ~ TC-SKILL-004: Level Skills (3개)

| 스킬 | 테스트 항목 | 우선순위 |
|------|------------|:--------:|
| starter | `/starter` 초기화, 가이드 | P0 |
| dynamic | `/dynamic` 초기화, BaaS 연동 | P0 |
| enterprise | `/enterprise` 초기화, MSA 구성 | P0 |

#### TC-SKILL-005 ~ TC-SKILL-013: Phase Skills (9개)

| 스킬 | 명령어 | 테스트 항목 | 우선순위 |
|------|--------|------------|:--------:|
| phase-1-schema | `/phase-1-schema` | 스키마 설계 가이드 | P1 |
| phase-2-convention | `/phase-2-convention` | 컨벤션 설정 | P1 |
| phase-3-mockup | `/phase-3-mockup` | 목업 생성 | P1 |
| phase-4-api | `/phase-4-api` | API 설계 | P1 |
| phase-5-design-system | `/phase-5-design-system` | 디자인 시스템 | P1 |
| phase-6-ui-integration | `/phase-6-ui-integration` | UI 통합 | P1 |
| phase-7-seo-security | `/phase-7-seo-security` | SEO/보안 | P1 |
| phase-8-review | `/phase-8-review` | 코드 리뷰 | P1 |
| phase-9-deployment | `/phase-9-deployment` | 배포 | P1 |

#### TC-SKILL-014 ~ TC-SKILL-021: Specialized Skills (8개)

| 스킬 | 테스트 항목 | 우선순위 |
|------|------------|:--------:|
| zero-script-qa | QA 가이드 | P1 |
| mobile-app | 모바일 앱 가이드 | P1 |
| desktop-app | 데스크톱 앱 가이드 | P1 |
| code-review | 코드 리뷰 | P1 |
| development-pipeline | 파이프라인 가이드 | P1 |
| bkit-templates | 템플릿 선택 | P1 |
| bkit-rules | 규칙 적용 | P0 |
| claude-code-learning | 학습 가이드 | P1 |

---

### 4.9 Agent Behavioral Tests (11 agents)

#### TC-AGENT-001: gap-detector

| ID | 테스트 항목 | 트리거 | 기대 결과 | 우선순위 |
|:--:|------------|--------|----------|:--------:|
| TC-AGENT-001-01 | 자동 호출 | '검증해줘' | 에이전트 실행 | P0 |
| TC-AGENT-001-02 | 분석 수행 | Design vs Code | Match Rate 계산 | P0 |
| TC-AGENT-001-03 | 결과 포맷 | - | 구조화된 JSON | P0 |
| TC-AGENT-001-04 | Stop Hook 연동 | 분석 완료 | 다음 단계 제안 | P0 |

#### TC-AGENT-002: pdca-iterator

| ID | 테스트 항목 | 트리거 | 기대 결과 | 우선순위 |
|:--:|------------|--------|----------|:--------:|
| TC-AGENT-002-01 | 자동 호출 | '개선해줘' | 에이전트 실행 | P0 |
| TC-AGENT-002-02 | Evaluator-Optimizer | Gap 기반 | 코드 수정 | P0 |
| TC-AGENT-002-03 | 반복 제어 | iterationCount | 최대 5회 | P0 |

#### TC-AGENT-003 ~ TC-AGENT-011: Other Agents

| 에이전트 | 테스트 항목 | 우선순위 |
|---------|------------|:--------:|
| report-generator | 보고서 생성 | P0 |
| code-analyzer | 코드 분석 | P1 |
| design-validator | 설계 검증 | P1 |
| qa-monitor | QA 모니터링 | P1 |
| starter-guide | 초보자 가이드 | P1 |
| bkend-expert | BaaS 전문가 | P1 |
| enterprise-expert | Enterprise 전문가 | P1 |
| pipeline-guide | 파이프라인 가이드 | P1 |
| infra-architect | 인프라 설계 | P1 |

---

### 4.10 Integration Tests

#### TC-INT-001: Hook Chain Test

| ID | 시나리오 | 기대 결과 | 우선순위 |
|:--:|---------|----------|:--------:|
| TC-INT-001-01 | SessionStart → UserPromptSubmit | 연속 실행 | P0 |
| TC-INT-001-02 | PreToolUse → Tool → PostToolUse | 체인 실행 | P0 |
| TC-INT-001-03 | PostToolUse → Stop | 상태 저장 | P0 |

#### TC-INT-002: PDCA Full Cycle Test

| ID | 시나리오 | 단계 | 기대 결과 | 우선순위 |
|:--:|---------|------|----------|:--------:|
| TC-INT-002-01 | Plan → Design | 문서 생성 | 2개 문서 | P0 |
| TC-INT-002-02 | Design → Do | 구현 가이드 | 체크리스트 | P0 |
| TC-INT-002-03 | Do → Check | Gap 분석 | Match Rate | P0 |
| TC-INT-002-04 | Check → Act | 자동 개선 | 코드 수정 | P0 |
| TC-INT-002-05 | Check → Report | 보고서 | 완료 보고서 | P0 |
| TC-INT-002-06 | Report → Archive | 아카이브 | 문서 이동 | P1 |

#### TC-INT-003: Skill-Agent Integration Test

| ID | 시나리오 | 기대 결과 | 우선순위 |
|:--:|---------|----------|:--------:|
| TC-INT-003-01 | /pdca analyze → gap-detector | 에이전트 호출 | P0 |
| TC-INT-003-02 | /pdca iterate → pdca-iterator | 에이전트 호출 | P0 |
| TC-INT-003-03 | /pdca report → report-generator | 에이전트 호출 | P0 |

---

### 4.11 E2E Tests

#### TC-E2E-001: New Feature Development

```
시나리오: 신규 기능 개발 전체 사이클
1. 세션 시작 → AskUserQuestion 확인
2. /pdca plan new-feature → Plan 문서 생성
3. /pdca design new-feature → Design 문서 생성
4. 코드 구현 (PreToolUse/PostToolUse 확인)
5. /pdca analyze new-feature → Gap 분석
6. /pdca iterate new-feature → 자동 개선 (필요시)
7. /pdca report new-feature → 완료 보고서
8. /pdca archive new-feature → 아카이브

기대 결과: 전체 PDCA 사이클 완료, 모든 문서 생성
우선순위: P0
```

#### TC-E2E-002: Session Resume

```
시나리오: 이전 세션 이어서 작업
1. 첫 번째 세션에서 /pdca plan 실행
2. 세션 종료
3. 새 세션 시작
4. PDCA 상태 복원 확인
5. /pdca next → 다음 단계 제안 확인

기대 결과: 상태 유지, 올바른 다음 단계 제안
우선순위: P0
```

#### TC-E2E-003: Multi-Language Trigger

```
시나리오: 다국어 트리거 테스트
1. '검증해줘' (한국어) → gap-detector
2. 'verify this' (영어) → gap-detector
3. '計画を作成して' (일본어) → pdca skill
4. '改进这个' (중국어) → pdca-iterator

기대 결과: 모든 언어에서 올바른 에이전트/스킬 트리거
우선순위: P1
```

---

## 5. Test Data

### 5.1 Sample Files

| 파일 | 용도 | 위치 |
|------|------|------|
| test-feature.plan.md | Plan 테스트 | docs/01-plan/features/ |
| test-feature.design.md | Design 테스트 | docs/02-design/features/ |
| test-code.js | 코드 분석 테스트 | tests/fixtures/ |
| test-config.json | 설정 테스트 | tests/fixtures/ |

### 5.2 Mock Data

```javascript
// Test PDCA Status
const mockPdcaStatus = {
  version: "2.0",
  activeFeatures: ["test-feature"],
  primaryFeature: "test-feature",
  features: {
    "test-feature": {
      phase: "plan",
      phaseNumber: 1,
      matchRate: null,
      iterationCount: 0
    }
  }
};

// Test Hook Input
const mockHookInput = {
  tool_name: "Write",
  tool_input: {
    file_path: "/test/path.js",
    content: "test content"
  }
};
```

---

## 6. Test Schedule

### 6.1 Phase 1: Unit Tests (Day 1-2)

| 일차 | 대상 | 테스트 케이스 수 |
|:----:|------|:---------------:|
| Day 1 AM | lib/core/ | 30+ |
| Day 1 PM | lib/pdca/ | 25+ |
| Day 2 AM | lib/intent/, lib/task/ | 30+ |
| Day 2 PM | Context Engineering | 25+ |

### 6.2 Phase 2: Functional Tests (Day 3-4)

| 일차 | 대상 | 테스트 케이스 수 |
|:----:|------|:---------------:|
| Day 3 AM | Hook Scripts | 40+ |
| Day 3 PM | Stop Scripts | 30+ |
| Day 4 AM | Skills | 30+ |
| Day 4 PM | Agents | 20+ |

### 6.3 Phase 3: Integration & E2E (Day 5)

| 일차 | 대상 | 테스트 케이스 수 |
|:----:|------|:---------------:|
| Day 5 AM | Integration | 10+ |
| Day 5 PM | E2E | 5+ |

---

## 7. Risk Analysis

### 7.1 Identified Risks

| 리스크 | 영향도 | 발생확률 | 대응 방안 |
|--------|:------:|:--------:|----------|
| Gemini 코드 잔존 | High | Low | Grep 검색으로 확인 |
| Hook 체인 깨짐 | High | Medium | 통합 테스트 우선 |
| 상태 손실 | Medium | Low | 스냅샷 복구 확인 |
| 다국어 트리거 오류 | Low | Medium | 언어별 테스트 |

### 7.2 Mitigation Strategies

1. **Gemini 잔존 코드**: `grep -r "gemini\|isGeminiCli" --include="*.js"` 실행
2. **Hook 체인**: Hook별 개별 테스트 후 체인 테스트
3. **상태 손실**: 테스트 전/후 상태 백업

---

## 8. Deliverables

### 8.1 Test Reports

| 문서 | 위치 | 생성 시점 |
|------|------|----------|
| Test Execution Report | docs/03-analysis/bkit-v1.5.0-test-results.md | Phase 완료 시 |
| Bug Report | docs/03-analysis/bkit-v1.5.0-bugs.md | 발견 시 |
| Coverage Report | docs/03-analysis/bkit-v1.5.0-coverage.md | 최종 |

### 8.2 Sign-off Criteria

- [ ] 모든 P0 테스트 통과
- [ ] P1 테스트 95% 이상 통과
- [ ] Gemini 관련 코드 0건 확인
- [ ] PDCA Full Cycle 1회 이상 완료
- [ ] 회귀 버그 0건

---

## 9. Appendix

### A. Test Case ID Convention

```
TC-{Category}-{Module}-{Sequence}

Categories:
- CORE: lib/core/ 모듈
- PDCA: lib/pdca/ 모듈
- INTENT: lib/intent/ 모듈
- TASK: lib/task/ 모듈
- CE: Context Engineering
- HOOK: Hook 스크립트
- STOP: Stop 스크립트
- SKILL: Skills
- AGENT: Agents
- INT: Integration
- E2E: End-to-End
```

### B. Priority Definitions

| Priority | 정의 | 테스트 시점 |
|:--------:|------|------------|
| P0 | 필수 - 핵심 기능 | Phase 1 |
| P1 | 중요 - 주요 기능 | Phase 2 |
| P2 | 권장 - 부가 기능 | Phase 3 |

### C. Related Documents

- [claude-code-exclusive-refactoring.plan.md](./claude-code-exclusive-refactoring.plan.md)
- [claude-code-exclusive-refactoring.design.md](../02-design/features/claude-code-exclusive-refactoring.design.md)
- [bkit-context-engineering-maturity-analysis.md](../03-analysis/bkit-context-engineering-maturity-analysis.md)

---

*Generated by bkit PDCA Plan Phase*
*Template: plan.template.md v1.1*
