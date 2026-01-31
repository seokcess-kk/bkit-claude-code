# bkit v1.4.7 전체 기능 테스트 계획서

> **Summary**: bkit 플러그인의 모든 기능(Skills, Agents, Hooks, Scripts, Lib)을 100% 커버리지로 테스트
>
> **Project**: bkit-claude-code
> **Version**: v1.4.7
> **Author**: AI Assistant (Claude Opus 4.5)
> **Date**: 2026-01-31
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

bkit v1.4.7 플러그인의 **모든 기능**을 체계적으로 테스트하여 Claude Code v2.1.27 환경에서 100% 정상 작동을 검증합니다.

### 1.2 Background

- 이전 테스트(claude-code-v2.1.27-compatibility-test)에서 39개 중 31개만 실제 테스트됨 (79%)
- 핵심 기능 외 전체 기능에 대한 포괄적 테스트 필요
- 코드베이스 완전 분석을 통한 100% 커버리지 테스트 계획 수립

### 1.3 Related Documents

- 이전 테스트 보고서: `docs/04-report/features/claude-code-v2.1.27-compatibility-test.report.md`
- bkit 설정: `bkit.config.json`
- Hook 설정: `hooks/hooks.json`

---

## 2. Scope

### 2.1 In Scope

- [x] **Skills (21개)**: 모든 Skill 파일 및 기능 테스트
- [x] **Agents (11개)**: 모든 Agent 실행 및 결과 검증
- [x] **Hooks (6종류)**: 모든 Hook 이벤트 트리거 테스트
- [x] **Scripts (40+개)**: 주요 스크립트 실행 검증
- [x] **Lib 모듈 (15+개)**: 핵심 라이브러리 기능 테스트
- [x] **Templates (15+개)**: 템플릿 로드 및 적용 테스트
- [x] **Commands (3개)**: 명령어 실행 테스트
- [x] **Configuration**: 설정 파일 로드 및 적용 테스트

### 2.2 Out of Scope

- Claude Code 자체 버그 (예: #22098 classifyHandoffIfNeeded)
- 외부 MCP 서버 연동 테스트
- 실제 배포 환경 테스트

---

## 3. 테스트 케이스 (총 127개)

### 3.1 Category 1: Skills 테스트 (21개 × 2 = 42개)

#### 3.1.1 PDCA Skill (9개 액션)

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| SK-01 | `/pdca plan` - Plan 문서 생성 | P0 | 실제 실행 |
| SK-02 | `/pdca design` - Design 문서 생성 | P0 | 실제 실행 |
| SK-03 | `/pdca do` - Do 가이드 표시 | P0 | 실제 실행 |
| SK-04 | `/pdca analyze` - Gap 분석 실행 | P0 | Agent 호출 확인 |
| SK-05 | `/pdca iterate` - 자동 개선 실행 | P0 | Agent 호출 확인 |
| SK-06 | `/pdca report` - 완료 보고서 생성 | P0 | Agent 호출 확인 |
| SK-07 | `/pdca archive` - 문서 아카이브 | P1 | 실제 실행 |
| SK-08 | `/pdca status` - 현재 상태 표시 | P0 | 실제 실행 |
| SK-09 | `/pdca next` - 다음 단계 안내 | P0 | 실제 실행 |

#### 3.1.2 Level Skills (3개)

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| SK-10 | `/starter` - Starter 가이드 표시 | P0 | 실제 실행 |
| SK-11 | `/dynamic` - Dynamic 가이드 표시 | P0 | 실제 실행 |
| SK-12 | `/enterprise` - Enterprise 가이드 표시 | P0 | 실제 실행 |

#### 3.1.3 Pipeline Skills (1개)

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| SK-13 | `/development-pipeline start` | P1 | 실제 실행 |
| SK-14 | `/development-pipeline next` | P1 | 실제 실행 |
| SK-15 | `/development-pipeline status` | P1 | 실제 실행 |

#### 3.1.4 Phase Skills (9개)

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| SK-16 | `/phase-1-schema` - 스키마 가이드 | P1 | 실제 실행 |
| SK-17 | `/phase-2-convention` - 컨벤션 가이드 | P1 | 실제 실행 |
| SK-18 | `/phase-3-mockup` - 목업 가이드 | P1 | 실제 실행 |
| SK-19 | `/phase-4-api` - API 가이드 | P1 | 실제 실행 |
| SK-20 | `/phase-5-design-system` - 디자인 시스템 | P1 | 실제 실행 |
| SK-21 | `/phase-6-ui-integration` - UI 통합 | P1 | 실제 실행 |
| SK-22 | `/phase-7-seo-security` - SEO/보안 | P1 | 실제 실행 |
| SK-23 | `/phase-8-review` - 리뷰 가이드 | P1 | 실제 실행 |
| SK-24 | `/phase-9-deployment` - 배포 가이드 | P1 | 실제 실행 |

#### 3.1.5 Utility Skills (6개)

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| SK-25 | `/code-review` - 코드 리뷰 | P0 | 실제 실행 |
| SK-26 | `/zero-script-qa` - 로그 기반 QA | P1 | 실제 실행 |
| SK-27 | `/claude-code-learning` - 학습 가이드 | P1 | 실제 실행 |
| SK-28 | `/bkit-rules` - 핵심 규칙 표시 | P0 | 실제 실행 |
| SK-29 | `/bkit-templates` - 템플릿 목록 | P1 | 실제 실행 |
| SK-30 | `/bkit` - 도움말 표시 | P0 | 실제 실행 |

#### 3.1.6 App Skills (2개)

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| SK-31 | `/mobile-app` - 모바일 앱 가이드 | P2 | 실제 실행 |
| SK-32 | `/desktop-app` - 데스크톱 앱 가이드 | P2 | 실제 실행 |

#### 3.1.7 Skill 로딩 테스트

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| SK-33 | Skill imports 로드 | P0 | 템플릿 참조 확인 |
| SK-34 | Skill argument-hint 표시 | P1 | UI 확인 |
| SK-35 | Skill 연결 Agents 호출 | P0 | Agent 실행 확인 |
| SK-36 | Skill allowed-tools 적용 | P1 | 도구 제한 확인 |
| SK-37 | Skill 자동 트리거 (키워드) | P1 | 키워드 입력 테스트 |
| SK-38 | Skill next-skill 연결 | P2 | 다음 스킬 안내 확인 |

---

### 3.2 Category 2: Agents 테스트 (11개 × 3 = 33개)

#### 3.2.1 PDCA Agents (3개)

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| AG-01 | gap-detector 실행 | P0 | Task로 호출 |
| AG-02 | gap-detector 결과 반환 | P0 | 결과 검증 |
| AG-03 | gap-detector Task 생성 | P0 | Task 확인 |
| AG-04 | pdca-iterator 실행 | P0 | Task로 호출 |
| AG-05 | pdca-iterator 자동 개선 | P0 | 코드 수정 확인 |
| AG-06 | pdca-iterator 반복 중단 조건 | P1 | 90% 도달 시 중단 |
| AG-07 | report-generator 실행 | P0 | Task로 호출 |
| AG-08 | report-generator 보고서 생성 | P0 | 파일 생성 확인 |
| AG-09 | report-generator 통합 분석 | P1 | 내용 검증 |

#### 3.2.2 Analysis Agents (2개)

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| AG-10 | code-analyzer 실행 | P0 | Task로 호출 |
| AG-11 | code-analyzer 품질 분석 | P0 | 결과 검증 |
| AG-12 | code-analyzer 보안 스캔 | P1 | 취약점 탐지 |
| AG-13 | design-validator 실행 | P1 | Task로 호출 |
| AG-14 | design-validator 문서 검증 | P1 | 결과 검증 |
| AG-15 | design-validator 일관성 체크 | P1 | 불일치 탐지 |

#### 3.2.3 Guide Agents (3개)

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| AG-16 | starter-guide 실행 | P0 | Task로 호출 |
| AG-17 | starter-guide 초보자 안내 | P0 | 가이드 내용 확인 |
| AG-18 | pipeline-guide 실행 | P1 | Task로 호출 |
| AG-19 | pipeline-guide 단계 안내 | P1 | 가이드 내용 확인 |
| AG-20 | qa-monitor 실행 | P1 | Task로 호출 |
| AG-21 | qa-monitor 로그 분석 | P1 | Docker 로그 모니터링 |

#### 3.2.4 Expert Agents (3개)

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| AG-22 | bkend-expert 실행 | P1 | Task로 호출 |
| AG-23 | bkend-expert BaaS 가이드 | P1 | 가이드 내용 확인 |
| AG-24 | enterprise-expert 실행 | P1 | Task로 호출 |
| AG-25 | enterprise-expert 전략 제안 | P1 | 가이드 내용 확인 |
| AG-26 | infra-architect 실행 | P1 | Task로 호출 |
| AG-27 | infra-architect 인프라 설계 | P1 | 가이드 내용 확인 |

#### 3.2.5 Agent 공통 테스트

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| AG-28 | Agent context fork 동작 | P0 | 컨텍스트 분리 확인 |
| AG-29 | Agent disallowedTools 적용 | P0 | 도구 제한 확인 |
| AG-30 | Agent model 설정 적용 | P1 | 모델 확인 |
| AG-31 | Agent imports 로드 | P1 | 템플릿 참조 확인 |
| AG-32 | Agent skills 연결 | P1 | 스킬 사용 확인 |
| AG-33 | Agent 종료 후 결과 반환 | P0 | 결과 수신 확인 |

---

### 3.3 Category 3: Hooks 테스트 (6종류 × 3 = 18개)

#### 3.3.1 SessionStart Hook

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| HK-01 | SessionStart hook 실행 | P0 | 세션 시작 시 확인 |
| HK-02 | session-start.js 실행 | P0 | 스크립트 실행 확인 |
| HK-03 | .bkit-memory.json 로드 | P0 | 파일 로드 확인 |
| HK-04 | 이전 PDCA 상태 복구 | P1 | 상태 표시 확인 |
| HK-05 | once: true 동작 | P1 | 1회만 실행 확인 |

#### 3.3.2 PreToolUse Hook

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| HK-06 | PreToolUse (Write\|Edit) hook | P0 | 파일 작성 시 확인 |
| HK-07 | pre-write.js 실행 | P0 | 스크립트 실행 확인 |
| HK-08 | PreToolUse (Bash) hook | P0 | Bash 실행 시 확인 |
| HK-09 | unified-bash-pre.js 실행 | P0 | 스크립트 실행 확인 |
| HK-10 | Hook matcher 패턴 동작 | P1 | 패턴 매칭 확인 |

#### 3.3.3 PostToolUse Hook

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| HK-11 | PostToolUse (Write) hook | P0 | 파일 작성 후 확인 |
| HK-12 | unified-write-post.js 실행 | P0 | 스크립트 실행 확인 |
| HK-13 | PostToolUse (Bash) hook | P0 | Bash 실행 후 확인 |
| HK-14 | unified-bash-post.js 실행 | P0 | 스크립트 실행 확인 |
| HK-15 | PostToolUse (Skill) hook | P0 | Skill 실행 후 확인 |
| HK-16 | skill-post.js 실행 | P0 | 스크립트 실행 확인 |

#### 3.3.4 Stop Hook

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| HK-17 | Stop hook 실행 | P1 | 세션 종료 시 확인 |
| HK-18 | unified-stop.js 실행 | P1 | 스크립트 실행 확인 |
| HK-19 | .bkit-memory.json 저장 | P1 | 파일 저장 확인 |

#### 3.3.5 UserPromptSubmit Hook

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| HK-20 | UserPromptSubmit hook 실행 | P0 | 프롬프트 제출 시 확인 |
| HK-21 | user-prompt-handler.js 실행 | P0 | 스크립트 실행 확인 |
| HK-22 | 의도 감지 동작 | P1 | 키워드 트리거 확인 |

#### 3.3.6 PreCompact Hook

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| HK-23 | PreCompact hook 실행 | P1 | 컨텍스트 압축 시 확인 |
| HK-24 | context-compaction.js 실행 | P1 | 스크립트 실행 확인 |
| HK-25 | auto\|manual matcher 동작 | P1 | 패턴 매칭 확인 |

---

### 3.4 Category 4: Task System 테스트 (10개)

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| TS-01 | TaskCreate 기본 생성 | P0 | API 호출 |
| TS-02 | TaskCreate activeForm 표시 | P0 | UI 확인 |
| TS-03 | TaskUpdate 상태 변경 | P0 | API 호출 |
| TS-04 | TaskUpdate 완료 처리 | P0 | API 호출 |
| TS-05 | TaskUpdate 삭제 처리 | P1 | API 호출 |
| TS-06 | TaskList 목록 조회 | P0 | API 호출 |
| TS-07 | TaskGet 상세 조회 | P0 | API 호출 |
| TS-08 | Task blockedBy 설정 | P0 | API 호출 |
| TS-09 | Task addBlocks 설정 | P1 | API 호출 |
| TS-10 | Task metadata 저장 | P1 | API 호출 |

---

### 3.5 Category 5: Lib 모듈 테스트 (15개)

#### 3.5.1 Core 모듈

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| LB-01 | lib/core/config.js 로드 | P0 | 설정 로드 확인 |
| LB-02 | lib/core/cache.js 동작 | P1 | 캐시 저장/조회 |
| LB-03 | lib/core/file.js 파일 처리 | P0 | 파일 읽기/쓰기 |
| LB-04 | lib/core/io.js 입출력 | P0 | 스트림 처리 |
| LB-05 | lib/core/debug.js 디버깅 | P2 | 로그 출력 |
| LB-06 | lib/core/platform.js 플랫폼 감지 | P1 | OS 확인 |

#### 3.5.2 Intent 모듈

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| LB-07 | lib/intent/language.js 언어 감지 | P0 | 8개 언어 테스트 |
| LB-08 | lib/intent/trigger.js 트리거 감지 | P0 | 키워드 매칭 |
| LB-09 | lib/intent/ambiguity.js 모호성 감지 | P1 | 질문 생성 |

#### 3.5.3 PDCA 모듈

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| LB-10 | lib/pdca/status.js 상태 관리 | P0 | 상태 읽기/쓰기 |
| LB-11 | lib/pdca/phase.js 단계 관리 | P0 | 단계 전환 |
| LB-12 | lib/pdca/level.js 레벨 감지 | P0 | 프로젝트 레벨 감지 |
| LB-13 | lib/pdca/tier.js 언어 티어 | P1 | 티어 분류 |
| LB-14 | lib/pdca/automation.js 자동화 | P1 | 자동 트리거 |

#### 3.5.4 Task 모듈

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| LB-15 | lib/task/creator.js Task 생성 | P0 | Task 생성 확인 |
| LB-16 | lib/task/tracker.js Task 추적 | P0 | 상태 추적 |
| LB-17 | lib/task/classification.js 분류 | P1 | 작업 분류 |
| LB-18 | lib/task/context.js 컨텍스트 | P1 | 컨텍스트 관리 |

#### 3.5.5 기타 모듈

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| LB-19 | lib/common.js 공통 유틸리티 | P0 | 함수 호출 |
| LB-20 | lib/memory-store.js 메모리 저장 | P0 | 저장/조회 |
| LB-21 | lib/import-resolver.js 임포트 해석 | P0 | 템플릿 로드 |
| LB-22 | lib/skill-orchestrator.js 스킬 조율 | P0 | 스킬 실행 |
| LB-23 | lib/permission-manager.js 권한 관리 | P1 | 권한 확인 |
| LB-24 | lib/context-fork.js 컨텍스트 분기 | P1 | 분기 동작 |
| LB-25 | lib/context-hierarchy.js 계층 구조 | P1 | 계층 관리 |

---

### 3.6 Category 6: Templates 테스트 (9개)

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| TM-01 | plan.template.md 로드 | P0 | 템플릿 적용 확인 |
| TM-02 | design.template.md 로드 | P0 | 템플릿 적용 확인 |
| TM-03 | analysis.template.md 로드 | P0 | 템플릿 적용 확인 |
| TM-04 | report.template.md 로드 | P0 | 템플릿 적용 확인 |
| TM-05 | do.template.md 로드 | P0 | 템플릿 적용 확인 |
| TM-06 | convention.template.md 로드 | P1 | 템플릿 적용 확인 |
| TM-07 | schema.template.md 로드 | P1 | 템플릿 적용 확인 |
| TM-08 | CLAUDE.template.md 로드 | P1 | 템플릿 적용 확인 |
| TM-09 | pipeline/*.template.md 로드 | P2 | 템플릿 적용 확인 |

---

### 3.7 Category 7: Configuration 테스트 (10개)

| ID | 테스트 케이스 | 우선순위 | 테스트 방법 |
|----|--------------|:--------:|------------|
| CF-01 | bkit.config.json 로드 | P0 | 설정 로드 확인 |
| CF-02 | sourceDirectories 설정 적용 | P1 | 디렉토리 탐색 |
| CF-03 | codeExtensions 설정 적용 | P1 | 파일 필터링 |
| CF-04 | pdca 설정 적용 | P0 | PDCA 경로 확인 |
| CF-05 | levelDetection 설정 적용 | P0 | 레벨 감지 확인 |
| CF-06 | agents 설정 적용 | P0 | Agent 매핑 확인 |
| CF-07 | permissions 설정 적용 | P0 | 권한 확인 |
| CF-08 | automation 설정 적용 | P1 | 자동화 설정 |
| CF-09 | hooks.json 로드 | P0 | Hook 설정 확인 |
| CF-10 | settings.json 로드 | P1 | 프로젝트 설정 |

---

## 4. 테스트 실행 전략

### 4.1 테스트 그룹별 실행 순서

```
Phase 1: Configuration & Lib (CF-*, LB-*)
    → 기반 모듈 검증 (20분)

Phase 2: Hooks (HK-*)
    → Hook 시스템 검증 (15분)

Phase 3: Templates (TM-*)
    → 템플릿 로드 검증 (10분)

Phase 4: Skills (SK-*)
    → 전체 스킬 검증 (30분)

Phase 5: Agents (AG-*)
    → 전체 에이전트 검증 (30분)

Phase 6: Task System (TS-*)
    → Task 시스템 검증 (10분)
```

### 4.2 우선순위별 테스트 수

| 우선순위 | 테스트 수 | 목표 Pass Rate |
|:--------:|:--------:|:-------------:|
| P0 (Critical) | 62개 | 100% |
| P1 (High) | 47개 | 95% |
| P2 (Medium) | 18개 | 90% |
| **총계** | **127개** | **95%** |

---

## 5. Success Criteria

### 5.1 Definition of Done

- [x] 127개 테스트 케이스 정의 완료
- [ ] 모든 P0 테스트 100% 통과
- [ ] 모든 P1 테스트 95% 이상 통과
- [ ] 전체 Pass Rate 95% 이상
- [ ] 결과 보고서 작성 완료

### 5.2 Quality Criteria

| 카테고리 | 테스트 수 | 최소 Pass Rate |
|----------|:--------:|:-------------:|
| Skills | 38 | 95% |
| Agents | 33 | 90% |
| Hooks | 25 | 95% |
| Task System | 10 | 100% |
| Lib | 25 | 90% |
| Templates | 9 | 95% |
| Configuration | 10 | 100% |

---

## 6. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|:------:|:----------:|------------|
| #22098 에러로 Agent 테스트 실패 표시 | Medium | High | 기능 정상 확인 시 PASS 처리 |
| 특수 조건 Hook 테스트 불가 | Low | Medium | 가능한 범위 내 테스트 |
| 장시간 테스트로 컨텍스트 초과 | High | Medium | Phase별 분할 실행 |
| 외부 의존성 테스트 불가 | Low | Low | Out of Scope로 처리 |

---

## 7. Test Environment

| 항목 | 값 |
|------|-----|
| Claude Code | v2.1.27 |
| bkit | v1.4.7 |
| Platform | macOS Darwin 24.6.0 |
| Node.js | 시스템 설치 버전 |
| 테스트 일시 | 2026-01-31 |

---

## 8. Next Steps

1. [x] 테스트 계획서 작성 완료
2. [ ] Phase 1: Configuration & Lib 테스트 실행
3. [ ] Phase 2: Hooks 테스트 실행
4. [ ] Phase 3: Templates 테스트 실행
5. [ ] Phase 4: Skills 테스트 실행
6. [ ] Phase 5: Agents 테스트 실행
7. [ ] Phase 6: Task System 테스트 실행
8. [ ] Gap 분석 (`/pdca analyze`)
9. [ ] 결과 보고서 작성 (`/pdca report`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-31 | 초기 버전 - 127개 테스트 케이스 정의 | AI Assistant |
