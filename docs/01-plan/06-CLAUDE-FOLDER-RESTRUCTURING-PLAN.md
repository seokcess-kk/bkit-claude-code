# 06. .claude 폴더 구조 개선 계획

## 문서 정보
- **작성일**: 2025-01-20
- **버전**: v1.2.0
- **상태**: Draft

---

## 1. 현재 문제

### 1.1 이중 관리 구조

```
bkit-claude-code/
├── commands/           ← Plugin용 (루트)
├── skills/             ← Plugin용 (루트)
├── agents/             ← Plugin용 (루트)
├── templates/          ← Plugin용 (루트)
├── hooks/              ← Plugin용 (루트)
├── scripts/            ← Plugin용 (루트)
├── lib/                ← Plugin용 (루트) [NEW]
├── bkit.config.json    ← Plugin용 (루트) [NEW]
│
└── .claude/            ← Manual 설치용 (중복 복사본)
    ├── commands/       ← 동일 내용
    ├── skills/         ← 동일 내용
    ├── agents/         ← 동일 내용
    ├── templates/      ← 동일 내용
    ├── hooks/          ← 동일 내용
    ├── scripts/        ← 동일 내용
    ├── lib/            ← 동일 내용 [NEW]
    └── bkit.config.json ← 동일 내용 [NEW]
```

### 1.2 발생하는 문제들

| 문제 | 설명 |
|------|------|
| **이중 유지보수** | 모든 변경을 두 곳에 적용해야 함 |
| **동기화 누락** | 한 곳만 수정하면 불일치 발생 |
| **혼란** | Source of truth가 불명확 |
| **저장소 비대화** | 동일 파일이 두 번 저장됨 |

### 1.3 원래 의도

두 가지 설치 방식 지원:

| 방식 | 대상 | 장점 |
|------|------|------|
| **Plugin 설치** | 빠른 시작 원하는 개인 | 자동 업데이트 |
| **Manual 설치** | 커스터마이징 원하는 팀 | 완전한 제어권 |

**핵심 가치**: 커스터마이징 자유

---

## 2. 제안하는 해결책: Override 패턴

### 2.1 개념

```
전역 Plugin (base)     +     프로젝트 .claude/ (override)
     ↓                              ↓
  기본 기능                   커스터마이징만
```

Claude Code의 파일 탐색 우선순위:
1. **프로젝트 `.claude/`** (최우선 - override)
2. 사용자 `~/.claude/`
3. **Plugin 설치 위치** (기본값)

### 2.2 Before vs After

#### Before (현재)
```bash
# Manual 설치: 전체 복사
cp -r bkit-claude-code/.claude your-project/

# 결과: 모든 파일 중복
your-project/.claude/
├── commands/      (15개)
├── skills/        (26개)
├── agents/        (11개)
├── templates/     (10개)
├── hooks/
├── scripts/
└── lib/
```

#### After (제안)
```bash
# 1. Plugin 설치 (기본 기능)
/plugin install bkit

# 2. 커스터마이징 필요시 해당 파일만 생성
your-project/.claude/
├── bkit.config.json           # 설정 override
└── skills/my-custom/SKILL.md  # 추가 스킬 (선택)
```

---

## 3. 구현 계획

### 3.1 Phase 1: 저장소 구조 정리

#### 3.1.1 `.claude/` 폴더 내용 정리

**삭제 대상** (루트와 중복):
```
.claude/
├── commands/       ← 삭제 (루트에 있음)
├── skills/         ← 삭제 (루트에 있음)
├── agents/         ← 삭제 (루트에 있음)
├── templates/      ← 삭제 (루트에 있음)
├── hooks/          ← 삭제 (루트에 있음, hooks.json만 유지)
├── scripts/        ← 삭제 (루트에 있음)
├── lib/            ← 삭제 (루트에 있음)
└── bkit.config.json ← 삭제 (루트에 있음)
```

**유지 대상** (Plugin 설정):
```
.claude/
├── settings.json        # Plugin 설정
├── settings.local.json  # 로컬 설정
├── docs/                # Plugin 내부 문서
└── sessions/            # 세션 데이터
```

#### 3.1.2 루트가 Source of Truth

```
bkit-claude-code/
├── .claude-plugin/      # Plugin manifest
│   ├── plugin.json
│   └── marketplace.json
│
├── commands/            # ✓ Source of truth
├── skills/              # ✓ Source of truth
├── agents/              # ✓ Source of truth
├── templates/           # ✓ Source of truth
├── hooks/               # ✓ Source of truth
├── scripts/             # ✓ Source of truth
├── lib/                 # ✓ Source of truth
├── bkit.config.json     # ✓ Source of truth
│
└── .claude/             # Plugin 설정만
    ├── settings.json
    └── docs/
```

### 3.2 Phase 2: 커스터마이징 가이드 작성

#### 3.2.1 사용자 가이드 문서

```markdown
# bkit 커스터마이징 가이드

## 기본 사용 (커스터마이징 없음)

Plugin 설치만으로 모든 기능 사용 가능:
\`\`\`bash
/plugin install bkit
\`\`\`

## 커스터마이징이 필요한 경우

### Step 1: Plugin 설치 위치 확인
\`\`\`bash
ls ~/.claude/plugins/bkit/
\`\`\`

### Step 2: 수정할 파일만 복사
\`\`\`bash
# 예: starter 스킬 커스터마이징
mkdir -p .claude/skills/starter
cp ~/.claude/plugins/bkit/skills/starter/SKILL.md .claude/skills/starter/
\`\`\`

### Step 3: 프로젝트에서 수정
프로젝트의 `.claude/skills/starter/SKILL.md` 수정

### Step 4: git에 커밋
\`\`\`bash
git add .claude/
git commit -m "feat: customize bkit starter skill"
\`\`\`

## 주의사항

⚠️ **커스터마이징한 파일은 Plugin 업데이트가 자동 반영되지 않습니다.**

- CHANGELOG를 주기적으로 확인하세요
- 필요시 수동으로 변경사항을 병합하세요
- 커스텀 파일 삭제 시 Plugin 기본값으로 복원됩니다
```

#### 3.2.2 커스터마이징 예시 템플릿

```
.claude/
├── bkit.config.json.example    # 설정 override 예시
└── README.md                    # 커스터마이징 가이드
```

### 3.3 Phase 3: README.md 업데이트

#### 3.3.1 설치 방법 섹션 수정

```markdown
## Installation

### Plugin Installation (Recommended)

\`\`\`bash
/plugin install bkit
\`\`\`

### Customization (Optional)

커스터마이징이 필요한 경우:

1. Plugin 설치 후 수정할 파일만 프로젝트의 `.claude/`에 복사
2. 자세한 내용은 [Customization Guide](docs/CUSTOMIZATION.md) 참조
```

#### 3.3.2 Manual 설치 섹션 제거 또는 수정

기존의 "전체 `.claude/` 폴더 복사" 방식 deprecate

---

## 4. 업데이트 동작 명세

### 4.1 파일별 업데이트 동작

| 파일 상태 | Plugin 업데이트 시 |
|-----------|-------------------|
| 커스터마이징 **안 함** | 자동 업데이트 |
| 커스터마이징 **함** | 업데이트 안 됨 (override 유지) |
| 커스텀 파일 **삭제** | Plugin 기본값 복원 |

### 4.2 시나리오 예시

```
시나리오: bkit v1.2 → v1.3 업데이트

Plugin 위치 (~/.claude/plugins/bkit/):
├── skills/starter/SKILL.md  ← v1.3으로 업데이트됨
└── skills/phase-1-schema/SKILL.md  ← v1.3으로 업데이트됨

프로젝트 (.claude/):
└── skills/starter/SKILL.md  ← 그대로 (커스텀 버전 유지)

결과:
- /starter 명령 → 프로젝트 커스텀 버전 사용
- /phase-1-schema 명령 → Plugin v1.3 버전 사용
```

---

## 5. 마이그레이션 가이드

### 5.1 기존 Manual 설치 사용자

```markdown
## 기존 .claude/ 폴더가 있는 경우

### Option A: Plugin으로 전환 (권장)

1. 기존 `.claude/` 백업
   \`\`\`bash
   mv .claude .claude.backup
   \`\`\`

2. Plugin 설치
   \`\`\`bash
   /plugin install bkit
   \`\`\`

3. 커스터마이징했던 파일만 복원
   \`\`\`bash
   # 예: 커스텀 스킬만 복원
   mkdir -p .claude/skills
   cp -r .claude.backup/skills/my-custom .claude/skills/
   \`\`\`

4. 백업 삭제
   \`\`\`bash
   rm -rf .claude.backup
   \`\`\`

### Option B: 기존 방식 유지

기존 `.claude/` 폴더 그대로 사용 가능
단, Plugin 업데이트 혜택을 받으려면 수동 병합 필요
```

---

## 6. 작업 체크리스트

### Phase 1: 저장소 정리
- [ ] `.claude/commands/` 삭제
- [ ] `.claude/skills/` 삭제
- [ ] `.claude/agents/` 삭제
- [ ] `.claude/templates/` 삭제
- [ ] `.claude/hooks/` 정리 (hooks.json → 루트로 이동 확인)
- [ ] `.claude/scripts/` 삭제
- [ ] `.claude/lib/` 삭제
- [ ] `.claude/bkit.config.json` 삭제

### Phase 2: 가이드 작성
- [ ] `docs/CUSTOMIZATION.md` 작성
- [ ] `.claude/README.md` 작성 (커스터마이징 안내)
- [ ] `.claude/bkit.config.json.example` 작성

### Phase 3: 문서 업데이트
- [ ] `README.md` 설치 섹션 수정
- [ ] `CHANGELOG.md` 업데이트
- [ ] `CONTRIBUTING.md` 업데이트 (기여 시 루트만 수정)

### Phase 4: 테스트
- [ ] Plugin 설치 후 기본 기능 동작 확인
- [ ] 커스터마이징 override 동작 확인
- [ ] Plugin 업데이트 시 override 유지 확인

---

## 7. 예상 효과

| 항목 | Before | After |
|------|--------|-------|
| 유지보수 | 두 곳 수정 | 한 곳만 수정 |
| 파일 수 (저장소) | ~200개 | ~100개 |
| 혼란도 | Source of truth 불명확 | 루트 = 정답 |
| 커스터마이징 | 전체 복사 후 수정 | 필요한 파일만 override |
| 업데이트 | 수동 전체 재복사 | 자동 (커스텀 제외) |

---

## 8. 리스크 및 대응

| 리스크 | 대응 방안 |
|--------|----------|
| 기존 Manual 사용자 혼란 | 마이그레이션 가이드 제공 |
| Plugin 시스템 미지원 환경 | 루트 폴더 직접 복사 가이드 제공 |
| 커스텀 파일 업데이트 누락 | CHANGELOG에 breaking changes 명시 |

---

## 9. 참고 자료

- [05-CLEAN-ARCHITECTURE-REFACTORING-PLAN.md](05-CLEAN-ARCHITECTURE-REFACTORING-PLAN.md)
- [Claude Code Plugin System Documentation](https://docs.anthropic.com/claude-code/plugins)
