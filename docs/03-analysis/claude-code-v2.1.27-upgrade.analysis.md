# Claude Code v2.1.25 → v2.1.27 버전업 영향도 분석

> **Analysis Date**: 2026-01-31
> **Version**: Claude Code v2.1.25 → v2.1.27
> **Report Type**: PDCA Check Phase - Gap Analysis
> **Author**: AI Assistant (Claude Opus 4.5)
> **Methodology**: bkit PDCA + Task Management System

---

## 1. Executive Summary

### 1.1 분석 개요

Claude Code v2.1.27이 릴리스되었습니다. v2.1.25에서 v2.1.27로의 업그레이드 시 **Permission 우선순위 변경**이라는 중요한 동작 변경이 있으며, GitHub 이슈 분석 결과 **session resume 컨텍스트 손실**, **freeze 버그**, **Task 시스템 에러** 등 여러 regression 이슈가 보고되고 있습니다.

### 1.2 핵심 변경사항 요약

| 버전 | 릴리스 일자 | 주요 변경 |
|------|------------|----------|
| v2.1.27 | 2026-01-30 | Permission 우선순위 변경, PR 링킹, 디버그 로그 강화 |
| v2.1.25 | 2026-01-28 | Gateway 사용자 beta header 검증 수정 |

### 1.3 위험도 평가

| 항목 | 평가 | 근거 |
|------|------|------|
| **전반적 호환성** | 🟡 주의 필요 (70%) | 주요 regression 이슈 다수 |
| **핵심 기능 영향** | 🔴 높음 | Permission, Task, Hook 관련 변경 |
| **즉시 업그레이드** | ⚠️ 대기 권장 | 안정화 대기 필요 |
| **bkit 코드 수정** | 🟢 불필요 | 코드 변경 없이 호환 |

---

## 2. 상세 변경사항 분석

### 2.1 v2.1.27 변경사항

#### 2.1.1 새로운 기능 (Added)

| 기능 | 설명 | bkit 영향도 |
|------|------|-------------|
| **`--from-pr` 플래그** | PR 번호/URL로 세션 재개 가능 | ⚪ 없음 |
| **PR 자동 링킹** | `gh pr create` 사용 시 세션-PR 자동 연결 | ⚪ 없음 |
| **VSCode: Claude in Chrome** | 브라우저 자동화 통합 활성화 | ⚪ 없음 |

#### 2.1.2 중요 동작 변경 (Changed)

| 변경 | 이전 동작 | 새 동작 | bkit 영향도 |
|------|----------|--------|-------------|
| **Permission 우선순위** | tool-level `allow` 우선 | content-level `ask` 우선 | 🟡 **확인 필요** |

```
★ Insight ─────────────────────────────────────
• 예시: allow: ["Bash"], ask: ["Bash(rm *)"] 설정 시
  - v2.1.25 이하: 모든 Bash 명령 허용 (allow 우선)
  - v2.1.27: rm 명령에 권한 프롬프트 표시 (ask 우선)
• bkit은 자체 permission 규칙을 사용하지 않으므로 직접 영향 낮음
• 사용자의 .claude/settings.json 설정에 따라 동작 변경 가능
─────────────────────────────────────────────────
```

#### 2.1.3 버그 수정 (Fixed)

| 버그 | 설명 | bkit 영향도 |
|------|------|-------------|
| **디버그 로그 강화** | Tool call 실패/거부 로깅 추가 | 🟢 **긍정적** - 디버깅 용이 |
| **Gateway context 오류** | `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1`로 회피 | ⚪ 해당 없음 |
| **/context 색상** | 색상 출력 복구 | ⚪ 없음 |
| **상태바 중복** | 백그라운드 태스크 표시 수정 | ⚪ 없음 |
| **Windows .bashrc** | Bash 명령 실행 수정 | ⚪ macOS 사용 |
| **VSCode OAuth** | 토큰 만료 401 에러 수정 | ⚪ CLI 사용 |

### 2.2 v2.1.25 변경사항

| 변경 | 설명 | bkit 영향도 |
|------|------|-------------|
| **Gateway beta header** | Bedrock/Vertex 사용자 검증 오류 수정 | ⚪ 해당 없음 |

---

## 3. GitHub 이슈 분석

### 3.1 v2.1.27 관련 Critical 이슈

| 이슈 | 제목 | 상태 | bkit 영향도 |
|------|------|------|-------------|
| **#22107** | 2.1.27 session resume 로직이 context를 잃어버림 | 🔴 OPEN | 🔴 **높음** |
| **#22103** | v2.1.27이 첫 메시지 후 freeze (v2.1.25 regression) | 🔴 OPEN | 🔴 **높음** |
| **#22097** | Synology NAS에서 100% CPU freeze | 🔴 OPEN | ⚪ 해당 없음 |
| **#22088** | macOS에서 --resume, /resume 사용 시 freeze | 🔴 OPEN | 🔴 **높음** |

### 3.2 Task 시스템 관련 이슈

| 이슈 | 제목 | 상태 | bkit 영향도 |
|------|------|------|-------------|
| **#22100** | Task blockedBy 데이터가 blocker 완료 후에도 유지됨 (display-only unblock) | 🟡 OPEN | 🟡 **중간** |
| **#22098** | Task agents 'classifyHandoffIfNeeded is not defined' 에러 | 🔴 OPEN | 🔴 **높음** |
| **#22087** | SubagentStop hook 'classifyHandoffIfNeeded is not defined' 실패 | 🔴 OPEN | 🔴 **높음** |

### 3.3 Plugin/Skill 관련 이슈

| 이슈 | 제목 | 상태 | bkit 영향도 |
|------|------|------|-------------|
| **#22112** | Plugin skills이 CLI autocomplete dropdown에 표시 안됨 | 🟡 OPEN | 🟡 **중간** |
| **#22114** | /resume 명령어에서 대부분의 세션 누락 | 🟡 OPEN | 🟡 **중간** |

### 3.4 이슈 상세 분석

#### #22107: Session Resume Context 손실

```
★ Critical Issue ──────────────────────────────
• 증상: v2.1.27에서 세션 재개 시 이전 컨텍스트 손실
• 영향: bkit의 PDCA 워크플로우 연속성 위협
• 회피: v2.1.25 유지 또는 핫픽스 대기
─────────────────────────────────────────────────
```

#### #22098/#22087: classifyHandoffIfNeeded 미정의 에러

```
★ Critical Issue ──────────────────────────────
• 증상: Task agents 및 SubagentStop hook에서 에러 발생
• 코드: 'classifyHandoffIfNeeded is not defined'
• 영향: bkit의 Task 에이전트 워크플로우 실패 가능
• 영향 범위: gap-detector, pdca-iterator 등 모든 에이전트
─────────────────────────────────────────────────
```

---

## 4. bkit 호환성 분석

### 4.1 현재 bkit 구성요소

| 구성요소 | 수량 | v2.1.27 호환성 |
|----------|------|----------------|
| **Hooks** | 6개 이벤트 | 🟡 주의 필요 (#22087) |
| **Skills** | 21개 | 🟡 주의 필요 (#22112) |
| **Agents** | 11개 | 🔴 위험 (#22098) |
| **Scripts** | 다수 | ✅ 호환 |

### 4.2 Hook 영향도 분석

| Hook 이벤트 | 현재 사용 | 영향받는 이슈 | 위험도 |
|-------------|----------|---------------|--------|
| **SessionStart** | `session-start.js` | #22107 (context 손실) | 🟡 중간 |
| **PreToolUse** | `pre-write.js`, `unified-bash-pre.js` | 없음 | 🟢 안전 |
| **PostToolUse** | `unified-write-post.js`, `unified-bash-post.js`, `skill-post.js` | 없음 | 🟢 안전 |
| **Stop** | `unified-stop.js` | #22087 (SubagentStop 에러) | 🔴 높음 |
| **UserPromptSubmit** | `user-prompt-handler.js` | 없음 | 🟢 안전 |
| **PreCompact** | `context-compaction.js` | 없음 | 🟢 안전 |

### 4.3 Agent 영향도 분석

| 에이전트 | 기능 | 영향받는 이슈 | 위험도 |
|----------|------|---------------|--------|
| **gap-detector** | 설계-구현 갭 분석 | #22098 | 🔴 높음 |
| **pdca-iterator** | 자동 개선 반복 | #22098 | 🔴 높음 |
| **report-generator** | 완료 보고서 생성 | #22098 | 🔴 높음 |
| **code-analyzer** | 코드 품질 분석 | #22098 | 🔴 높음 |
| **qa-monitor** | Zero Script QA | #22098 | 🔴 높음 |
| **design-validator** | 설계 문서 검증 | #22098 | 🔴 높음 |
| **starter-guide** | 초보자 가이드 | #22098 | 🔴 높음 |
| **pipeline-guide** | 파이프라인 가이드 | #22098 | 🔴 높음 |
| **bkend-expert** | bkend.ai BaaS 전문가 | #22098 | 🔴 높음 |
| **enterprise-expert** | 엔터프라이즈 전문가 | #22098 | 🔴 높음 |
| **infra-architect** | 인프라 아키텍트 | #22098 | 🔴 높음 |

### 4.4 Skill 영향도 분석

| 위험도 | 스킬 | 영향 |
|--------|------|------|
| 🟡 중간 | 모든 21개 스킬 | #22112로 인해 CLI autocomplete에서 표시 안될 수 있음 |

---

## 5. 위험 매트릭스

### 5.1 종합 위험도

| 위험 영역 | 가능성 | 영향도 | 종합 위험 | 대응 우선순위 |
|-----------|--------|--------|----------|---------------|
| Session resume 실패 | 높음 | 높음 | 🔴 Critical | P0 |
| Agent 실행 에러 | 높음 | 높음 | 🔴 Critical | P0 |
| Hook 실패 | 중간 | 중간 | 🟡 High | P1 |
| Skill 검색 불가 | 중간 | 낮음 | 🟢 Medium | P2 |

### 5.2 영향받는 bkit 워크플로우

| 워크플로우 | 위험도 | 영향 설명 |
|------------|--------|----------|
| **PDCA 전체 사이클** | 🔴 높음 | Agent 에러로 Check/Act 단계 실패 가능 |
| **세션 연속성** | 🔴 높음 | Resume 시 context 손실 |
| **Task 의존성 추적** | 🟡 중간 | blockedBy 표시 오류 |
| **Skill 호출** | 🟡 중간 | Autocomplete에서 누락 가능 |

---

## 6. 권장 조치 사항

### 6.1 즉시 조치 (P0)

| 조치 | 설명 | 상태 |
|------|------|------|
| **v2.1.25 유지** | v2.1.27 업그레이드 보류 | ✅ 권장 |
| **이슈 모니터링** | #22107, #22098, #22087 추적 | 📋 진행 중 |

### 6.2 단기 조치 (P1) - 1주

| 조치 | 설명 | 상태 |
|------|------|------|
| **핫픽스 대기** | v2.1.28 또는 패치 릴리스 대기 | ⏳ 대기 |
| **테스트 환경 검증** | 별도 환경에서 v2.1.27 테스트 | 📋 예정 |

### 6.3 중기 조치 (P2) - 2주

| 조치 | 설명 | 상태 |
|------|------|------|
| **호환성 테스트** | 모든 bkit 기능 v2.1.27 테스트 | 📋 예정 |
| **문서 업데이트** | 버전 호환성 가이드 작성 | 📋 예정 |

---

## 7. 테스트 체크리스트

### 7.1 v2.1.27 업그레이드 전 필수 테스트

#### 핵심 기능 테스트

- [ ] SessionStart hook 정상 실행
- [ ] 세션 재개 시 context 유지 확인
- [ ] `/resume` 명령어 세션 목록 정상 표시

#### Agent 테스트

- [ ] gap-detector 에이전트 정상 작동
- [ ] pdca-iterator 에이전트 정상 작동
- [ ] Task 에이전트 에러 없이 완료
- [ ] SubagentStop hook 에러 없음

#### Task 시스템 테스트

- [ ] TaskCreate 정상 작동
- [ ] TaskUpdate (blockedBy) 정상 업데이트
- [ ] Task 완료 시 blocker 상태 정상 해제

#### Skill 테스트

- [ ] `/pdca` 시리즈 autocomplete 표시
- [ ] `/starter`, `/dynamic`, `/enterprise` 검색 가능
- [ ] Skill 호출 정상 작동

---

## 8. 버전별 호환성 매트릭스

| Claude Code 버전 | bkit 호환성 | 권장 여부 | 비고 |
|------------------|-------------|----------|------|
| v2.1.20 | ✅ 완전 호환 | ⭐ 권장 | 안정 버전 |
| v2.1.25 | ✅ 완전 호환 | ⭐ 권장 | 현재 안정 |
| **v2.1.27** | 🟡 부분 호환 | ⚠️ 대기 | Regression 이슈 다수 |

---

## 9. 참고 자료

### 9.1 공식 자료

- [Claude Code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- [Claude Code Releases](https://github.com/anthropics/claude-code/releases)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)

### 9.2 관련 이슈

- [#22107 - Session resume context loss](https://github.com/anthropics/claude-code/issues/22107)
- [#22103 - v2.1.27 freeze after first message](https://github.com/anthropics/claude-code/issues/22103)
- [#22098 - Task agents classifyHandoffIfNeeded error](https://github.com/anthropics/claude-code/issues/22098)
- [#22087 - SubagentStop hook failure](https://github.com/anthropics/claude-code/issues/22087)
- [#22112 - Plugin skills not in autocomplete](https://github.com/anthropics/claude-code/issues/22112)
- [#22100 - Task blockedBy persistence issue](https://github.com/anthropics/claude-code/issues/22100)

### 9.3 bkit 내부 문서

- [hooks/hooks.json](../../hooks/hooks.json) - bkit 훅 구성
- [skills/](../../skills/) - bkit 스킬 디렉토리 (21개)
- [agents/](../../agents/) - bkit 에이전트 디렉토리 (11개)
- [이전 분석: v2.1.20 업그레이드](../04-report/claude-code-2.1.20-upgrade.report.md)

---

## 10. 결론

### 10.1 종합 평가

Claude Code v2.1.27은 PR 링킹 등 유용한 기능이 추가되었으나, **session resume 컨텍스트 손실**, **Task 에이전트 에러**, **SubagentStop hook 실패** 등 심각한 regression 이슈가 다수 보고되고 있습니다.

### 10.2 권장 사항

| 권장 사항 | 이유 |
|----------|------|
| **v2.1.25 유지** | 안정성 확보 |
| **v2.1.27 업그레이드 보류** | Critical 이슈 해결 대기 |
| **핫픽스 모니터링** | v2.1.28 릴리스 시 재평가 |

### 10.3 Match Rate

| 항목 | 점수 |
|------|------|
| **코드 수정 필요** | 0% (수정 불필요) |
| **기능 호환성** | 70% |
| **안정성** | 50% |
| **업그레이드 권장도** | 30% |
| **종합 Match Rate** | **50%** |

```
─────────────────────────────────────────────────
⚠️ 결론: v2.1.27 업그레이드 보류 권장
   - 현재 버전(v2.1.25) 유지
   - Critical 이슈 해결 후 재평가
   - 예상 재평가 시점: v2.1.28 릴리스
─────────────────────────────────────────────────
```

---

> **Analysis Generated**: 2026-01-31T15:00:00+09:00
> **Next Review**: v2.1.28 릴리스 후 또는 Critical 이슈 해결 시
> **PDCA Phase**: Check (Gap Analysis Complete)
> **Recommended Next**: Act (업그레이드 보류, 모니터링 계속)
