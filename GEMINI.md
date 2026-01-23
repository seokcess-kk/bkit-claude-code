# bkit Vibecoding Kit for Gemini CLI

> AI-Native Development with PDCA Methodology
> Version: 1.4.0

---

## Core Principles

### 1. Automation First, Commands are Shortcuts
```
Gemini automatically applies PDCA methodology.
Commands are shortcuts for power users.
```

### 2. SoR (Single Source of Truth) Priority
```
1st: Codebase (actual working code)
2nd: GEMINI.md / Convention docs
3rd: docs/ design documents
```

### 3. No Guessing
```
Unknown → Check documentation
Not in docs → Ask user
Never guess
```

---

## PDCA Workflow

### Phase 1: Plan
- Use `/pdca-plan {feature}` to create plan document
- Stored in `docs/01-plan/features/{feature}.plan.md`

### Phase 2: Design
- Use `/pdca-design {feature}` to create design document
- Stored in `docs/02-design/features/{feature}.design.md`

### Phase 3: Do (Implementation)
- Implement based on design document
- Apply coding conventions from this file

### Phase 4: Check
- Use `/pdca-analyze {feature}` for gap analysis
- Stored in `docs/03-analysis/{feature}.analysis.md`

### Phase 5: Act
- Use `/pdca-iterate {feature}` for auto-fix if < 90%
- Use `/pdca-report {feature}` for completion report

---

## Level System

### Starter (Basic)
- Static websites, simple apps
- HTML/CSS/JavaScript, Next.js basics
- Friendly explanations, step-by-step guidance

### Dynamic (Intermediate)
- Fullstack apps with BaaS
- Authentication, database, API integration
- Technical but clear explanations

### Enterprise (Advanced)
- Microservices, Kubernetes, Terraform
- High traffic, high availability
- Concise, use technical terms

---

## Available Commands

| Command | Description |
|---------|-------------|
| `/pdca-status` | Check current PDCA status |
| `/pdca-plan {feature}` | Generate Plan document |
| `/pdca-design {feature}` | Generate Design document |
| `/pdca-analyze {feature}` | Run Gap analysis |
| `/pdca-iterate {feature}` | Auto-fix iteration loop |
| `/pdca-report {feature}` | Generate completion report |
| `/pdca-next` | Guide to next PDCA step |
| `/init-starter` | Initialize Starter project |
| `/init-dynamic` | Initialize Dynamic project |
| `/init-enterprise` | Initialize Enterprise project |
| `/pipeline-start` | Start development pipeline guide |
| `/pipeline-status` | Check pipeline progress |
| `/pipeline-next` | Guide to next pipeline phase |
| `/zero-script-qa` | Run Zero Script QA |
| `/learn-claude-code` | Claude Code learning guide |
| `/setup-claude-code` | Project setup generation |
| `/upgrade-claude-code` | Claude Code settings upgrade |
| `/upgrade-level` | Upgrade project level |
| `/archive` | Archive completed documents |
| `/github-stats` | Collect GitHub statistics |

---

## Trigger Keywords

When user mentions these keywords, consider using corresponding skills:

| Keyword | Language | Skill/Action |
|---------|----------|--------------|
| gap analysis, verify, check | EN | Gap Analysis |
| 갭 분석, 검증, 확인 | KO | Gap Analysis |
| ギャップ分析, 検証 | JA | Gap Analysis |
| 差距分析, 验证 | ZH | Gap Analysis |
| iterate, improve, fix | EN | Auto-fix iteration |
| 개선, 고쳐, 반복 | KO | Auto-fix iteration |
| 改善, イテレーション | JA | Auto-fix iteration |
| 改进, 迭代 | ZH | Auto-fix iteration |
| analyze, quality, review | EN | Code quality analysis |
| 분석, 품질, 리뷰 | KO | Code quality analysis |
| report, summary | EN | Generate report |
| 보고서, 요약 | KO | Generate report |
| QA, test, log | EN | Zero Script QA |
| 테스트, 로그 | KO | Zero Script QA |
| design, spec | EN | Design validation |
| 설계, 스펙 | KO | Design validation |

---

## Task Size Rules

| Size | Lines | PDCA Level | Action |
|------|-------|------------|--------|
| Quick Fix | <10 | None | No guidance needed |
| Minor Change | <50 | Light | "PDCA optional" mention |
| Feature | <200 | Recommended | Design doc recommended |
| Major Feature | >=200 | Required | Design doc strongly recommended |

---

## Check-Act Iteration Loop

```
gap-detector (Check) → Match Rate 확인
    ├── >= 90% → report-generator (완료)
    ├── 70-89% → 선택 제공 (수동/자동)
    └── < 70% → pdca-iterator 권장 (Act)
                   ↓
              수정 후 gap-detector 재실행
                   ↓
              반복 (최대 5회)
```

---

## Template References

When generating PDCA documents, use these templates:

| Document Type | Template Location |
|---------------|-------------------|
| Plan | `templates/plan.template.md` |
| Design | `templates/design.template.md` |
| Analysis | `templates/analysis.template.md` |
| Report | `templates/report.template.md` |
| _INDEX | `templates/_INDEX.template.md` |

---

## Available Skills

| Skill | Description |
|-------|-------------|
| `bkit-rules` | Core PDCA rules and code quality standards |
| `development-pipeline` | 9-phase development guide |
| `starter` | Starter level project guidance |
| `dynamic` | Dynamic level (BaaS) guidance |
| `enterprise` | Enterprise level (MSA) guidance |
| `phase-1-schema` ~ `phase-9-deployment` | Phase-specific guidance |
| `zero-script-qa` | QA methodology via Docker logs |

---

## Important Notes

1. **Hooks Activation Required**: Add to `~/.gemini/settings.json`:
   ```json
   {
     "tools": {
       "enableHooks": true
     }
   }
   ```

2. **Cross-platform Compatibility**: All scripts use Node.js for Windows/macOS/Linux support.

3. **Environment Variables**:
   - `GEMINI_PROJECT_DIR`: Current project directory
   - `BKIT_PLATFORM`: Set to "gemini" automatically

---

**Generated by**: bkit Vibecoding Kit
**Template Version**: 1.4.0 (Dual Platform Support)
