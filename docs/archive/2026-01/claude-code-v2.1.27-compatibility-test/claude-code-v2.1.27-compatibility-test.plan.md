# Claude Code v2.1.27 호환성 테스트 계획서

> **Summary**: Claude Code v2.1.27 버전에서 bkit 플러그인의 모든 기능 호환성 검증
>
> **Project**: bkit-claude-code
> **Version**: v1.4.7
> **Author**: AI Assistant (Claude Opus 4.5)
> **Date**: 2026-01-31
> **Status**: In Progress

---

## 1. Overview

### 1.1 Purpose

Claude Code v2.1.25에서 v2.1.27로 업그레이드된 환경에서 bkit 플러그인의 모든 기능이 정상적으로 작동하는지 검증합니다. GitHub 이슈에서 보고된 잠재적 문제들이 실제로 bkit에 영향을 미치는지 확인하고, 필요한 수정사항을 파악합니다.

### 1.2 Background

- **업그레이드 버전**: v2.1.25 → v2.1.27
- **주요 변경사항**: Permission 우선순위 변경, PR 링킹, 디버그 로그 강화
- **잠재적 이슈**: Session resume context 손실, Task agents 에러, SubagentStop hook 실패
- **사전 분석 문서**: `docs/03-analysis/claude-code-v2.1.27-upgrade.analysis.md`

### 1.3 Related Documents

- 분석 문서: [claude-code-v2.1.27-upgrade.analysis.md](../../03-analysis/claude-code-v2.1.27-upgrade.analysis.md)
- 이전 업그레이드 보고서: [claude-code-2.1.20-upgrade.report.md](../../04-report/claude-code-2.1.20-upgrade.report.md)
- bkit hooks 설정: [hooks/hooks.json](../../../hooks/hooks.json)

---

## 2. Scope

### 2.1 In Scope

- [x] Hook 시스템 테스트 (6개 이벤트)
- [x] Skill 시스템 테스트 (21개 스킬)
- [x] Agent 시스템 테스트 (11개 에이전트)
- [x] Task 시스템 테스트 (CRUD + 의존성)
- [x] Session 연속성 테스트
- [x] Permission 동작 테스트

### 2.2 Out of Scope

- Windows 환경 테스트 (macOS 환경에서만 진행)
- VSCode 확장 테스트 (CLI 환경에서만 진행)
- Gateway/Bedrock/Vertex 환경 테스트

---

## 3. Test Categories

### 3.1 Category 1: Hook 시스템 테스트

| ID | 테스트 케이스 | 테스트 방법 | 예상 결과 | 우선순위 |
|----|--------------|------------|----------|:--------:|
| **H-01** | SessionStart hook 실행 | 새 세션 시작 후 hook 메시지 확인 | "Success" 메시지 출력 | P0 |
| **H-02** | PreToolUse (Write) hook | 파일 작성 시도 시 hook 트리거 | pre-write.js 실행됨 | P0 |
| **H-03** | PreToolUse (Edit) hook | 파일 수정 시도 시 hook 트리거 | pre-write.js 실행됨 | P0 |
| **H-04** | PreToolUse (Bash) hook | Bash 명령 실행 시 hook 트리거 | unified-bash-pre.js 실행됨 | P0 |
| **H-05** | PostToolUse (Write) hook | 파일 작성 완료 후 hook 트리거 | unified-write-post.js 실행됨 | P0 |
| **H-06** | PostToolUse (Bash) hook | Bash 명령 완료 후 hook 트리거 | unified-bash-post.js 실행됨 | P0 |
| **H-07** | PostToolUse (Skill) hook | Skill 실행 완료 후 hook 트리거 | skill-post.js 실행됨 | P0 |
| **H-08** | Stop hook 실행 | 세션 종료/중단 시 hook 트리거 | unified-stop.js 실행됨 | P0 |
| **H-09** | UserPromptSubmit hook | 사용자 입력 제출 시 hook 트리거 | user-prompt-handler.js 실행됨 | P1 |
| **H-10** | PreCompact hook | 컨텍스트 압축 시 hook 트리거 | context-compaction.js 실행됨 | P1 |

### 3.2 Category 2: Task 시스템 테스트

| ID | 테스트 케이스 | 테스트 방법 | 예상 결과 | 우선순위 |
|----|--------------|------------|----------|:--------:|
| **T-01** | TaskCreate 기본 생성 | 새 Task 생성 | Task ID 반환, 상태 pending | P0 |
| **T-02** | TaskUpdate 상태 변경 | Task 상태를 in_progress로 변경 | 상태 정상 업데이트 | P0 |
| **T-03** | TaskUpdate 완료 처리 | Task 상태를 completed로 변경 | 상태 정상 업데이트 | P0 |
| **T-04** | TaskList 목록 조회 | 현재 Task 목록 조회 | 모든 Task 표시 | P0 |
| **T-05** | TaskGet 상세 조회 | 특정 Task ID로 상세 정보 조회 | 전체 정보 반환 | P0 |
| **T-06** | Task blockedBy 설정 | Task 간 의존성 설정 | blockedBy 관계 설정됨 | P1 |
| **T-07** | Task blockedBy 해제 | 선행 Task 완료 시 blocker 해제 | blockedBy 자동 해제 (#22100 테스트) | P0 |
| **T-08** | TaskUpdate 삭제 | status: "deleted"로 삭제 | Task 삭제됨 | P1 |

### 3.3 Category 3: Skill 시스템 테스트

| ID | 테스트 케이스 | 테스트 방법 | 예상 결과 | 우선순위 |
|----|--------------|------------|----------|:--------:|
| **S-01** | /pdca plan 스킬 | `/pdca plan test-feature` 실행 | Plan 문서 생성됨 | P0 |
| **S-02** | /pdca status 스킬 | `/pdca status` 실행 | 현재 상태 표시 | P0 |
| **S-03** | /pdca next 스킬 | `/pdca next` 실행 | 다음 단계 안내 | P1 |
| **S-04** | /starter 스킬 | `/starter` 실행 | Starter 가이드 표시 | P1 |
| **S-05** | /dynamic 스킬 | `/dynamic` 실행 | Dynamic 가이드 표시 | P1 |
| **S-06** | /enterprise 스킬 | `/enterprise` 실행 | Enterprise 가이드 표시 | P1 |
| **S-07** | /development-pipeline 스킬 | `/development-pipeline status` 실행 | 파이프라인 상태 표시 | P1 |
| **S-08** | /code-review 스킬 | `/code-review` 실행 | 코드 리뷰 시작 | P1 |
| **S-09** | /bkit 스킬 | `/bkit` 실행 | bkit 도움말 표시 | P0 |
| **S-10** | Skill autocomplete | `/pd` 입력 후 Tab | pdca 관련 스킬 표시 (#22112 테스트) | P0 |

### 3.4 Category 4: Agent 시스템 테스트

| ID | 테스트 케이스 | 테스트 방법 | 예상 결과 | 우선순위 |
|----|--------------|------------|----------|:--------:|
| **A-01** | gap-detector Agent | Task 에이전트로 gap-detector 호출 | 정상 실행, 에러 없음 (#22098 테스트) | P0 |
| **A-02** | pdca-iterator Agent | Task 에이전트로 pdca-iterator 호출 | 정상 실행, 에러 없음 | P0 |
| **A-03** | report-generator Agent | Task 에이전트로 report-generator 호출 | 정상 실행, 에러 없음 | P0 |
| **A-04** | code-analyzer Agent | Task 에이전트로 code-analyzer 호출 | 정상 실행, 에러 없음 | P1 |
| **A-05** | starter-guide Agent | Task 에이전트로 starter-guide 호출 | 정상 실행, 에러 없음 | P1 |
| **A-06** | design-validator Agent | Task 에이전트로 design-validator 호출 | 정상 실행, 에러 없음 | P1 |

### 3.5 Category 5: Session 연속성 테스트

| ID | 테스트 케이스 | 테스트 방법 | 예상 결과 | 우선순위 |
|----|--------------|------------|----------|:--------:|
| **R-01** | 세션 컨텍스트 유지 | 대화 중 이전 컨텍스트 참조 | 이전 내용 정상 기억 | P0 |
| **R-02** | Task 상태 지속성 | Task 생성 후 다음 턴에서 확인 | Task 상태 유지됨 | P0 |
| **R-03** | .bkit-memory.json 업데이트 | PDCA 작업 후 메모리 파일 확인 | 정상 업데이트됨 | P0 |

### 3.6 Category 6: Permission/에러 처리 테스트

| ID | 테스트 케이스 | 테스트 방법 | 예상 결과 | 우선순위 |
|----|--------------|------------|----------|:--------:|
| **P-01** | Hook 에러 메시지 표시 | 의도적 hook 에러 발생 | 에러 메시지 사용자에게 표시 | P1 |
| **P-02** | Tool 호출 거부 로깅 | 디버그 로그 확인 | 거부 사유 로깅됨 | P2 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] 모든 P0 테스트 케이스 100% 통과
- [x] 모든 P1 테스트 케이스 100% 통과
- [x] P2 테스트 케이스 80% 이상 통과
- [x] Critical 버그 0건
- [x] 테스트 결과 보고서 작성 완료

### 4.2 Quality Criteria

| 등급 | 기준 | 조치 |
|------|------|------|
| ✅ PASS | 테스트 통과, 기대 결과와 일치 | 없음 |
| ⚠️ WARN | 테스트 통과, 경미한 이슈 발견 | 문서화 |
| ❌ FAIL | 테스트 실패, 기능 작동 안함 | 즉시 수정 필요 |

### 4.3 Pass Rate 목표

| 카테고리 | 테스트 수 | 목표 Pass Rate |
|----------|----------|----------------|
| Hook 시스템 | 10개 | 100% |
| Task 시스템 | 8개 | 100% |
| Skill 시스템 | 10개 | 90% |
| Agent 시스템 | 6개 | 100% |
| Session 연속성 | 3개 | 100% |
| Permission/에러 | 2개 | 80% |
| **총계** | **39개** | **95%** |

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| #22098 Agent 에러 발생 | High | Medium | 에러 발생 시 workaround 문서화 |
| #22100 blockedBy 해제 안됨 | Medium | Medium | 수동 해제 방법 확인 |
| #22112 Skill autocomplete 누락 | Low | Medium | 직접 타이핑으로 대체 |
| Session context 손실 | High | Low | 현재 세션에서 테스트하므로 영향 적음 |

---

## 6. Test Execution Plan

### 6.1 실행 순서

```
Phase 1: Hook 시스템 테스트 (H-01 ~ H-10)
    ↓
Phase 2: Task 시스템 테스트 (T-01 ~ T-08)
    ↓
Phase 3: Skill 시스템 테스트 (S-01 ~ S-10)
    ↓
Phase 4: Agent 시스템 테스트 (A-01 ~ A-06)
    ↓
Phase 5: Session 연속성 테스트 (R-01 ~ R-03)
    ↓
Phase 6: Permission/에러 테스트 (P-01 ~ P-02)
```

### 6.2 Task 시스템 활용

각 테스트 Phase에 대해 Task를 생성하고 진행 상황 추적:

```
[Test-Phase1] Hook 시스템 테스트 (10개)
[Test-Phase2] Task 시스템 테스트 (8개)
[Test-Phase3] Skill 시스템 테스트 (10개)
[Test-Phase4] Agent 시스템 테스트 (6개)
[Test-Phase5] Session 연속성 테스트 (3개)
[Test-Phase6] Permission/에러 테스트 (2개)
```

---

## 7. Test Environment

### 7.1 환경 정보

| 항목 | 값 |
|------|-----|
| Claude Code 버전 | v2.1.27 |
| bkit 버전 | v1.4.7 |
| 플랫폼 | macOS Darwin 24.6.0 |
| Node.js | (시스템 설치 버전) |
| 테스트 일자 | 2026-01-31 |

### 7.2 테스트 데이터

- 테스트용 임시 파일: `/tmp/bkit-test/`
- 테스트용 Task: 별도 생성 후 삭제

---

## 8. Next Steps

1. [x] 테스트 계획서 작성 완료
2. [ ] Task 생성하여 테스트 Phase 관리
3. [ ] Phase별 테스트 실행 (`/pdca iterate`)
4. [ ] 테스트 결과 수집 및 분석
5. [ ] 최종 보고서 작성 (`/pdca report`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-31 | Initial draft - 39개 테스트 케이스 정의 | AI Assistant |
