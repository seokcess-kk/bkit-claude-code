# Features Cleanup Planning Document

> **Summary**: `.pdca-status.json`의 features 필드 무한 누적 문제 해결 및 자동 정리 메커니즘 구현
>
> **Project**: bkit-claude-code
> **Version**: v1.4.8
> **Author**: Claude
> **Date**: 2026-01-31
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

`.pdca-status.json` 파일의 `features` 객체가 무한정 누적되는 구조적 결함을 해결하여:
- 파일 크기 무한 증가 방지
- 메모리 사용 최적화
- Archive 완료 후 자동 정리 지원

### 1.2 Background

**현재 문제 상황:**
- `history` 필드: 100개 제한 있음 (정상)
- `features` 필드: **제한 없음** (문제)
- Archive 후에도 features에서 제거되지 않음
- 현재 파일 크기: 42.9KB (증가 추세)

**발견된 코드 결함:**
```javascript
// lib/pdca/status.js - removeActiveFeature()
// activeFeatures 배열에서만 제거, features 객체는 유지됨
status.activeFeatures = status.activeFeatures.filter(f => f !== feature);
// ❌ delete status.features[feature] 없음
```

### 1.3 Related Documents

- 분석 보고서: 이전 대화에서 Explore Agent 분석 결과
- 관련 코드: `lib/pdca/status.js`, `lib/task/tracker.js`, `scripts/archive-feature.js`

---

## 2. Scope

### 2.1 In Scope

- [x] `deleteFeatureFromStatus()` 함수 구현
- [x] Archive 완료 시 features 자동 정리 연동
- [x] Features 개수 제한 로직 추가 (최대 50개)
- [x] Archived features 별도 저장소 옵션
- [x] 수동 정리 명령 추가 (`/pdca cleanup`)

### 2.2 Out of Scope

- 기존 archived features 마이그레이션 (수동 처리)
- `.pdca-status.json` 스키마 버전 업그레이드 (v2.0 유지)
- 시계열 메트릭 수집 (v2.0+ 예정)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `deleteFeatureFromStatus(feature)` 함수 구현 | High | Pending |
| FR-02 | Archive 완료 후 features에서 자동 제거 | High | Pending |
| FR-03 | Features 최대 개수 제한 (50개) | Medium | Pending |
| FR-04 | Archived features 요약 정보만 보존 옵션 | Medium | Pending |
| FR-05 | `/pdca cleanup` 수동 정리 명령 추가 | Low | Pending |
| FR-06 | 정리 시 확인 프롬프트 표시 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 파일 크기 50KB 미만 유지 | 스냅샷 크기 모니터링 |
| Reliability | 정리 중 데이터 손실 없음 | Archive 파일 존재 확인 후 삭제 |
| Compatibility | 기존 .pdca-status.json 호환 | v2.0 스키마 유지 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] `deleteFeatureFromStatus()` 함수 구현 및 테스트
- [x] Archive 스크립트에서 자동 호출 연동
- [x] Features 개수 제한 로직 동작 확인
- [x] 기존 기능 회귀 테스트 통과

### 4.2 Quality Criteria

- [x] 단위 테스트 작성 (deleteFeatureFromStatus)
- [x] 통합 테스트 (Archive → Cleanup 플로우)
- [x] 수동 QA (실제 feature archive 후 확인)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Archive 전 삭제로 데이터 손실 | High | Low | Archive 파일 존재 확인 후 삭제 |
| 활성 feature 실수 삭제 | High | Low | activeFeatures 체크, 확인 프롬프트 |
| 기존 워크플로우 영향 | Medium | Medium | 기본 동작 유지, 옵션으로 추가 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules | Web apps with backend | ☒ |
| **Enterprise** | Strict layer separation | Complex architectures | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 삭제 시점 | Archive 후 즉시 / 주기적 / 수동 | Archive 후 즉시 | 데이터 일관성 |
| 보존 방식 | 완전 삭제 / 요약 보존 / 별도 파일 | 완전 삭제 | 단순성, Archive에 전체 보존됨 |
| 제한 방식 | 개수 제한 / 크기 제한 / 기간 제한 | 개수 제한 (50개) | 구현 단순성 |

### 6.3 수정 대상 파일

```
lib/pdca/status.js
├── deleteFeatureFromStatus()     # 신규 추가
├── cleanupArchivedFeatures()     # 신규 추가
└── updatePdcaStatus()            # 개수 제한 로직 추가

scripts/archive-feature.js
└── archiveFeature()              # cleanup 호출 추가

.claude/skills/pdca/pdca.skill.md
└── cleanup 명령 문서화           # 신규 추가
```

---

## 7. Implementation Plan

### 7.1 Phase 1: Core Functions (FR-01, FR-02)

**Step 1: deleteFeatureFromStatus() 구현**

```javascript
// lib/pdca/status.js에 추가
function deleteFeatureFromStatus(feature) {
  const status = getPdcaStatusFull(true);

  if (!status.features[feature]) {
    return { success: false, reason: 'Feature not found' };
  }

  // 활성 feature인지 확인
  if (status.activeFeatures.includes(feature) &&
      status.features[feature].phase !== 'archived') {
    return { success: false, reason: 'Cannot delete active feature' };
  }

  // features에서 삭제
  delete status.features[feature];

  // activeFeatures에서도 제거
  status.activeFeatures = status.activeFeatures.filter(f => f !== feature);

  // primaryFeature 업데이트
  if (status.primaryFeature === feature) {
    status.primaryFeature = status.activeFeatures[0] || null;
  }

  // history에 기록
  status.history.push({
    timestamp: new Date().toISOString(),
    action: 'feature_deleted',
    feature: feature
  });

  savePdcaStatus(status);
  return { success: true };
}
```

**Step 2: archive-feature.js 연동**

```javascript
// scripts/archive-feature.js 수정
const { deleteFeatureFromStatus } = require('../lib/pdca/status');

async function archiveFeature(feature) {
  // 기존 아카이브 로직...

  // 아카이브 완료 후 status에서 삭제
  const result = deleteFeatureFromStatus(feature);
  if (!result.success) {
    console.warn(`Warning: Could not cleanup feature: ${result.reason}`);
  }
}
```

### 7.2 Phase 2: Auto Cleanup (FR-03, FR-04)

**Step 3: Features 개수 제한**

```javascript
// lib/pdca/status.js - updatePdcaStatus() 내부에 추가
function enforceFeatureLimit(status, maxFeatures = 50) {
  const featureCount = Object.keys(status.features).length;

  if (featureCount <= maxFeatures) return;

  // archived 상태인 것부터 삭제 (오래된 순)
  const archived = Object.entries(status.features)
    .filter(([_, f]) => f.phase === 'archived')
    .sort((a, b) => new Date(a[1].archivedAt) - new Date(b[1].archivedAt));

  const toDelete = featureCount - maxFeatures;
  for (let i = 0; i < Math.min(toDelete, archived.length); i++) {
    delete status.features[archived[i][0]];
  }
}
```

### 7.3 Phase 3: Manual Cleanup (FR-05, FR-06)

**Step 4: /pdca cleanup 명령 추가**

PDCA Skill에 cleanup 액션 추가:
- 현재 archived features 목록 표시
- 선택적 삭제 또는 전체 삭제 옵션
- 삭제 전 확인 프롬프트

---

## 8. Testing Plan

### 8.1 Unit Tests

| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| Delete archived feature | `deleteFeatureFromStatus('archived-feature')` | `{ success: true }` |
| Delete active feature | `deleteFeatureFromStatus('active-feature')` | `{ success: false, reason: 'Cannot delete active feature' }` |
| Delete non-existent | `deleteFeatureFromStatus('unknown')` | `{ success: false, reason: 'Feature not found' }` |
| Enforce limit | 60 features, max 50 | 10 archived features 삭제됨 |

### 8.2 Integration Tests

1. Feature 생성 → Archive → Status 확인 (features에서 제거됨)
2. 50개 초과 feature 생성 → 자동 정리 확인
3. `/pdca cleanup` 실행 → 선택적 삭제 동작 확인

---

## 9. Next Steps

1. [ ] Design 문서 작성 (`features-cleanup.design.md`)
2. [ ] 코드 구현
3. [ ] 테스트 및 검증
4. [ ] `/pdca archive` 명령과 통합

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-31 | Initial draft | Claude |
