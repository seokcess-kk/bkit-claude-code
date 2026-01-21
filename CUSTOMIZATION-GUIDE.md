# Claude Code Plugin Customization Guide

A comprehensive guide to customizing Claude Code plugins for your organization, using bkit as a reference implementation.

---

## Table of Contents

1. [bkit Design Philosophy](#1-bkit-design-philosophy)
2. [Understanding Plugin Architecture](#2-understanding-plugin-architecture)
3. [Configuration Paths by Platform](#3-configuration-paths-by-platform)
4. [Plugin Components Overview](#4-plugin-components-overview)
5. [Customizing Agents](#5-customizing-agents)
6. [Customizing Skills](#6-customizing-skills)
7. [Customizing Commands](#7-customizing-commands)
8. [Customizing Hooks](#8-customizing-hooks)
9. [Creating Templates](#9-creating-templates)
10. [Organization-Specific Customization](#10-organization-specific-customization)
11. [Best Practices](#11-best-practices)
12. [License & Attribution](#license--attribution)

---

## 1. bkit Design Philosophy

Before customizing bkit, understanding its design intent helps you make better decisions about what to adapt and what to keep.

### Core Mission

> **"Enable all developers using Claude Code to naturally adopt 'document-driven development' and 'continuous improvement' even without knowing commands or PDCA methodology"**

In essence: **AI guides humans toward good development practices**.

### Three Core Philosophies

| Philosophy | Description | Implementation |
|------------|-------------|----------------|
| **Automation First** | Claude automatically applies PDCA even if user doesn't know commands | `bkit-rules` skill + PreToolUse hooks |
| **No Guessing** | If unsure, check docs → If not in docs, ask user (never guess) | Design-first workflow, `gap-detector` agent |
| **Docs = Code** | Design first, implement later (maintain design-implementation sync) | PDCA workflow + `/pdca-analyze` command |

### Well-Designed Aspects Worth Preserving

When customizing bkit, consider keeping these architectural patterns:

#### 1. Layered Trigger System

```
Layer 1: hooks.json          → SessionStart, PreToolUse, PostToolUse hooks
Layer 2: Skill Frontmatter   → hooks: PreToolUse, PostToolUse, Stop
Layer 3: Agent Frontmatter   → hooks: PreToolUse, PostToolUse
Layer 4: Description Triggers → "Triggers:" keyword matching
Layer 5: Scripts             → Actual bash logic execution
```

This separation allows fine-grained control over when and how automation triggers.

#### 2. Level-Based Adaptation

bkit automatically adjusts its behavior based on detected project complexity:

| Level | Detection | Behavior |
|-------|-----------|----------|
| **Starter** | Simple HTML/CSS structure | Friendly explanations, simplified PDCA |
| **Dynamic** | Next.js + BaaS indicators | Technical but clear, full PDCA |
| **Enterprise** | K8s/Terraform/microservices | Concise, architecture-focused |

#### 3. PDCA Within Each Phase

```
Pipeline Phase (e.g., API Implementation)
├── Plan: Define requirements
├── Design: Write spec
├── Do: Implement
├── Check: Gap analysis
└── Act: Document learnings
```

Each of the 9 pipeline phases runs its own PDCA cycle—not one PDCA for the whole project.

#### 4. Zero Script QA

Instead of writing test scripts, bkit uses:
- Structured JSON logging
- Request ID flow tracking
- AI-powered real-time log analysis
- Automatic issue documentation

### What to Customize vs. Keep

| Keep As-Is | Safe to Customize |
|------------|-------------------|
| PDCA workflow structure | Trigger keywords (add your language) |
| Level detection logic | Agent communication style |
| Hook event architecture | Template content and structure |
| Gap analysis methodology | Skill domain knowledge |

### Design Documentation

For deeper understanding, explore the `bkit-system/` folder:

| Document | Purpose |
|----------|---------|
| [bkit-system/README.md](bkit-system/README.md) | System architecture overview |
| [Core Mission](bkit-system/philosophy/core-mission.md) | 3 philosophies explained |
| [AI-Native Principles](bkit-system/philosophy/ai-native-principles.md) | AI-Native development model |
| [PDCA Methodology](bkit-system/philosophy/pdca-methodology.md) | PDCA + 9-stage pipeline |
| [Graph Index](bkit-system/_GRAPH-INDEX.md) | Obsidian visualization hub |

> **Tip**: Open `bkit-system/` as an [Obsidian](https://obsidian.md/) vault and press `Ctrl/Cmd + G` to visualize all component relationships.

---

## 2. Understanding Plugin Architecture

### How Plugins Work

When you install a Claude Code plugin, components are deployed to the global configuration directory (`~/.claude/`). To customize these for your specific projects, you can copy and modify them in your project's `.claude/` directory.

### Configuration Hierarchy (Precedence Order)

```
1. Managed Settings    → Enterprise/IT-controlled (highest priority)
2. Command Line Args   → Temporary session overrides
3. Project Local       → .claude/settings.local.json (personal, gitignored)
4. Project Shared      → .claude/settings.json (team-shared)
5. User Global         → ~/.claude/settings.json (lowest priority)
```

**Key Insight**: Project-level configurations override global configurations with the same name.

---

## 3. Configuration Paths by Platform

### User Configuration (Global)

| Platform | Path |
|----------|------|
| **macOS** | `~/.claude/` |
| **Linux** | `~/.claude/` |
| **Windows (PowerShell)** | `%USERPROFILE%\.claude\` or `C:\Users\<username>\.claude\` |
| **Windows (WSL)** | `/home/<username>/.claude/` (Linux filesystem, NOT `/mnt/c/...`) |

### Managed Settings (Enterprise/Admin)

| Platform | Path |
|----------|------|
| **macOS** | `/Library/Application Support/ClaudeCode/` |
| **Linux/WSL** | `/etc/claude-code/` |
| **Windows** | `C:\Program Files\ClaudeCode\` |

> **Note**: Managed settings require administrator privileges and cannot be overridden by users.

### Directory Structure

```
~/.claude/                          # Global user configuration
├── settings.json                   # User settings, permissions, plugins
├── .claude.json                    # OAuth, MCP servers, preferences
├── CLAUDE.md                       # Global instructions for all projects
├── agents/                         # Global custom subagents
├── skills/                         # Global custom skills
├── commands/                       # Global custom commands (legacy)
└── plans/                          # Plan files storage

.claude/                            # Project-level configuration
├── settings.json                   # Team-shared project settings
├── settings.local.json             # Personal project settings (gitignored)
├── CLAUDE.md                       # Project-level instructions
├── CLAUDE.local.md                 # Personal project instructions (gitignored)
├── agents/                         # Project-specific subagents
├── skills/                         # Project-specific skills
└── commands/                       # Project-specific commands
```

---

## 4. Plugin Components Overview

A Claude Code plugin like bkit consists of these components:

| Component | Purpose | Location |
|-----------|---------|----------|
| **Agents** | Specialized AI subagents for task delegation | `agents/` |
| **Skills** | Knowledge and instructions Claude follows | `skills/<name>/SKILL.md` |
| **Commands** | User-invocable slash commands | `commands/` |
| **Hooks** | Event-triggered scripts/prompts | `hooks/` |
| **Templates** | Document templates for standardization | `templates/` |
| **Scripts** | Helper scripts for automation | `scripts/` |

### bkit Plugin Structure Example

```
bkit-claude-code/
├── .claude-plugin/
│   ├── plugin.json                 # Plugin metadata
│   └── marketplace.json            # Marketplace registration
├── agents/
│   ├── starter-guide.md            # Beginner-friendly agent
│   ├── enterprise-expert.md        # Enterprise architecture agent
│   ├── code-analyzer.md            # Code review agent
│   └── ...
├── skills/
│   ├── bkit-rules/SKILL.md         # Core PDCA rules
│   ├── development-pipeline/SKILL.md
│   └── phase-*/SKILL.md            # 9-phase pipeline skills
├── commands/
│   ├── pdca-plan.md                # /pdca-plan command
│   ├── pdca-design.md              # /pdca-design command
│   └── ...
├── hooks/
│   ├── hooks.json                  # Hook configuration
│   └── session-start.sh            # Session initialization
└── templates/
    ├── plan.template.md
    └── design.template.md
```

---

## 5. Customizing Agents

Agents are specialized AI subagents that Claude spawns to delegate specific tasks.

### Agent File Format

Create a markdown file with YAML frontmatter in `agents/` or `.claude/agents/`:

```markdown
---
name: your-agent-name
description: |
  Brief description of what this agent does.

  Use proactively when [trigger conditions].

  Triggers: keyword1, keyword2, 한국어, 日本語

  Do NOT use for: [exclusion conditions]
permissionMode: acceptEdits  # or bypassPermissions, default
model: sonnet                # or opus, haiku
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - WebSearch
skills:
  - skill-name               # Skills this agent can access
---

# Agent Title

## Role

Describe the agent's primary role and responsibilities.

## Communication Style

Define how the agent should communicate.

## Task Guidelines

Provide specific instructions for handling tasks.
```

### Key Frontmatter Fields

| Field | Description |
|-------|-------------|
| `name` | Unique identifier (kebab-case) |
| `description` | Multi-line description with triggers and exclusions |
| `permissionMode` | `default`, `acceptEdits`, `bypassPermissions` |
| `model` | `sonnet` (default), `opus`, `haiku` |
| `tools` | List of allowed tools |
| `skills` | List of skills the agent can reference |

### Customization Example: Creating an Organization-Specific Agent

**Original bkit agent** (`agents/starter-guide.md`):
```markdown
---
name: starter-guide
description: |
  Friendly guide agent for non-developers and beginners.
  ...
---
```

**Customized for your organization** (`.claude/agents/onboarding-guide.md`):
```markdown
---
name: onboarding-guide
description: |
  ACME Corp onboarding guide for new developers.
  Explains company-specific conventions, tools, and workflows.

  Use proactively when user mentions "new hire", "onboarding",
  "how do we", "company standards", or asks about internal tools.

  Triggers: onboarding, new hire, company policy, internal tools

  Do NOT use for: general programming questions, external projects
permissionMode: acceptEdits
model: sonnet
tools:
  - Read
  - Glob
  - Grep
  - WebFetch
skills:
  - company-conventions
  - internal-apis
---

# ACME Corp Onboarding Guide

## Role

Help new developers understand ACME Corp's development practices.

## Key Topics

### 1. Repository Structure
- All projects use monorepo structure
- Frontend code lives in `packages/web/`
- Backend code lives in `packages/api/`

### 2. Code Review Process
- All PRs require 2 approvals
- Use conventional commits
- Run `npm run lint` before pushing

### 3. Internal Tools
- Deployment: Use `/deploy staging` or `/deploy production`
- Monitoring: Access Grafana at internal.acme.com/grafana
```

---

## 6. Customizing Skills

Skills are knowledge bases that Claude automatically loads when relevant.

### Skill File Structure

```
skills/
└── your-skill/
    ├── SKILL.md                # Required: Main skill definition
    ├── reference.md            # Optional: Additional documentation
    ├── examples/               # Optional: Example files
    └── scripts/                # Optional: Helper scripts
```

### SKILL.md Format

```markdown
---
name: your-skill
description: |
  What this skill does and when Claude should use it.
  Be specific about trigger conditions.

  Triggers: keyword1, keyword2

  Do NOT use for: exclusion conditions
user-invocable: true           # Show in /slash menu
disable-model-invocation: false # Allow Claude to auto-invoke
allowed-tools: Read, Grep, Glob # Restrict available tools
hooks:                         # Skill-specific hooks
  PreToolUse:
    - matcher: "Write"
      hooks:
        - type: command
          command: "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
---

# Skill Content

Detailed instructions Claude follows when this skill is active.
```

### Frontmatter Reference

| Field | Default | Description |
|-------|---------|-------------|
| `name` | Directory name | Display name and /command |
| `description` | First paragraph | When to use (Claude reads this) |
| `user-invocable` | `true` | Show in /slash menu |
| `disable-model-invocation` | `false` | Prevent auto-loading |
| `allowed-tools` | All | Comma-separated tool list |
| `context` | - | Set to `fork` for subagent |
| `agent` | - | `Explore`, `Plan`, `general-purpose` |
| `model` | - | Override model for this skill |

### Invocation Control Matrix

| Configuration | User Can Invoke | Claude Can Invoke | Use Case |
|---------------|-----------------|-------------------|----------|
| Default | Yes | Yes | Knowledge, guidelines |
| `disable-model-invocation: true` | Yes | No | Workflows with side effects |
| `user-invocable: false` | No | Yes | Background context |

### Customization Example: Company Coding Standards

**Create** `.claude/skills/company-standards/SKILL.md`:

```markdown
---
name: company-standards
description: |
  ACME Corp coding standards and conventions.
  Applied automatically when writing or reviewing code.

  Triggers: code style, naming convention, lint, formatting
---

# ACME Corp Coding Standards

## Naming Conventions

### Files
- React components: PascalCase (`UserProfile.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: SCREAMING_SNAKE_CASE in `.constants.ts` files

### Variables
- Boolean: prefix with `is`, `has`, `should`
- Arrays: use plural nouns (`users`, `items`)
- Functions: use verbs (`getUser`, `handleSubmit`)

## Code Structure

### React Components
```tsx
// 1. Imports (external → internal → types → styles)
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui';
import { formatDate } from '@/utils';

import type { User } from '@/types';
import styles from './UserProfile.module.css';

// 2. Types/Interfaces
interface UserProfileProps {
  userId: string;
}

// 3. Component
export function UserProfile({ userId }: UserProfileProps) {
  // hooks first
  // handlers second
  // render last
}
```

## Error Handling

Always use our custom error classes:
```typescript
import { ApiError, ValidationError } from '@/errors';

throw new ApiError('User not found', 404);
throw new ValidationError('Invalid email format');
```

## Git Commit Messages

Follow Conventional Commits:
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
Scope: component name or feature area

Example: feat(auth): add OAuth2 login support
```
```

---

## 7. Customizing Commands

Commands are user-invoked slash commands (e.g., `/deploy`, `/review`).

### Command File Format

Create `.md` files in `commands/` or `.claude/commands/`:

```markdown
---
description: Short description shown in /slash menu
allowed-tools: ["Read", "Write", "Bash"]
argument-hint: [environment] [options]
---

# Command Instructions

Detailed instructions for Claude when this command is invoked.

## Arguments

- `$ARGUMENTS`: All arguments passed to the command
- `$1`, `$2`: Individual arguments

## Tasks Performed

1. Step one
2. Step two
3. Step three

## Usage Examples

```
/your-command staging
/your-command production --force
```
```

### Dynamic Context with Shell Commands

Use `` !`command` `` syntax to inject dynamic content:

```markdown
---
description: Create PR with context
allowed-tools: ["Bash"]
---

## Current Context
- Branch: !`git branch --show-current`
- Changes: !`git diff --stat`
- Recent commits: !`git log -3 --oneline`

Create a pull request based on the above context.
```

### Customization Example: Deployment Command

**Create** `.claude/commands/deploy.md`:

```markdown
---
description: Deploy application to specified environment
allowed-tools: ["Bash", "Read"]
argument-hint: [staging|production]
disable-model-invocation: true
---

# Deployment Command

Deploy the application to the specified environment.

## Environment Validation

Valid environments: `staging`, `production`

If `$ARGUMENTS` is empty or invalid, ask the user to specify.

## Pre-deployment Checks

Before deploying, verify:
1. All tests pass: `npm run test`
2. Build succeeds: `npm run build`
3. No uncommitted changes: `git status`

## Deployment Steps

### For Staging
```bash
npm run deploy:staging
```

### For Production
```bash
# Require explicit confirmation
npm run deploy:production
```

## Post-deployment

1. Verify deployment: `curl https://$ARGUMENTS.acme.com/health`
2. Notify team in Slack (if configured)
3. Update deployment log

## Output Format

```
🚀 Deployment Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Environment: $ARGUMENTS
Version: [version]
Time: [timestamp]
Status: ✅ Success

📋 Checklist:
☑ Tests passed
☑ Build completed
☑ Deployed successfully
☑ Health check passed

🔗 URL: https://$ARGUMENTS.acme.com
```
```

---

## 8. Customizing Hooks

Hooks are event-triggered callbacks that run at specific points in Claude's lifecycle.

### Hook Events

| Event | When It Fires |
|-------|---------------|
| `PreToolUse` | Before a tool is called |
| `PostToolUse` | After a tool completes |
| `Stop` | When Claude finishes responding |
| `SubagentStop` | When a subagent completes |
| `SessionStart` | When a new session begins |
| `SessionEnd` | When a session ends |
| `UserPromptSubmit` | Before user prompt is processed |
| `PreCompact` | Before context compaction |
| `Notification` | When a notification is shown |

### hooks.json Format

Create `hooks/hooks.json`:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-hooks.json",
  "SessionStart": [
    {
      "once": true,
      "hooks": [
        {
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh",
          "timeout": 5000
        }
      ]
    }
  ],
  "PreToolUse": {
    "Bash": {
      "hooks": [
        {
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/hooks/validate-bash.sh"
        }
      ]
    },
    "Write": {
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Before writing, verify the file follows our coding standards."
        }
      ]
    }
  },
  "PostToolUse": {
    "Write": {
      "hooks": [
        {
          "type": "command",
          "command": "npm run lint:fix -- $TOOL_INPUT_PATH"
        }
      ]
    }
  }
}
```

### Hook Types

#### Command Hooks
Execute shell commands:
```json
{
  "type": "command",
  "command": "/path/to/script.sh",
  "timeout": 5000
}
```

#### Prompt Hooks
Inject instructions into Claude's context:
```json
{
  "type": "prompt",
  "prompt": "Remember to follow our security guidelines when handling user data."
}
```

### Environment Variables in Hooks

| Variable | Description |
|----------|-------------|
| `${CLAUDE_PLUGIN_ROOT}` | Plugin installation directory |
| `$TOOL_INPUT` | Input passed to the tool |
| `$TOOL_INPUT_PATH` | File path (for file operations) |
| `$TOOL_OUTPUT` | Output from the tool (PostToolUse) |
| `$CLAUDE_SESSION_ID` | Current session ID |
| `$CLAUDE_ENV_FILE` | File for persisting environment variables |

### Customization Example: Pre-commit Validation

**Create** `.claude/hooks/hooks.json`:

```json
{
  "PreToolUse": {
    "Bash(git commit:*)": {
      "hooks": [
        {
          "type": "command",
          "command": ".claude/hooks/pre-commit.sh"
        }
      ]
    }
  },
  "PostToolUse": {
    "Write": {
      "hooks": [
        {
          "type": "command",
          "command": "npx prettier --write $TOOL_INPUT_PATH 2>/dev/null || true"
        }
      ]
    }
  }
}
```

**Create** `.claude/hooks/pre-commit.sh`:

```bash
#!/bin/bash

# Validate before committing
echo "Running pre-commit checks..."

# Check for sensitive data
if grep -r "API_KEY\|SECRET\|PASSWORD" --include="*.ts" --include="*.js" src/; then
    cat << 'JSON'
{
  "decision": "block",
  "reason": "Potential sensitive data detected. Please review before committing."
}
JSON
    exit 0
fi

# Check for console.log
if grep -r "console\.log" --include="*.ts" --include="*.tsx" src/; then
    cat << 'JSON'
{
  "decision": "block",
  "reason": "console.log statements found. Remove before committing."
}
JSON
    exit 0
fi

# All checks passed
cat << 'JSON'
{
  "decision": "allow"
}
JSON
```

---

## 9. Creating Templates

Templates standardize document creation across your organization.

### Template Location

```
templates/
├── plan.template.md
├── design.template.md
├── analysis.template.md
└── report.template.md
```

### Template Variables

| Variable | Description |
|----------|-------------|
| `{feature}` | Feature name from arguments |
| `{date}` | Current date |
| `{author}` | Author name |
| `{project}` | Project name |

### Template Example

**Create** `templates/feature-spec.template.md`:

```markdown
# Feature Specification: {feature}

**Author**: {author}
**Date**: {date}
**Status**: Draft

---

## 1. Overview

### 1.1 Problem Statement
<!-- What problem does this feature solve? -->

### 1.2 Proposed Solution
<!-- High-level description of the solution -->

### 1.3 Success Criteria
<!-- How do we measure success? -->

---

## 2. Requirements

### 2.1 Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | | High |
| FR-002 | | Medium |

### 2.2 Non-Functional Requirements
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Performance | < 200ms response |
| NFR-002 | Availability | 99.9% uptime |

---

## 3. Technical Design

### 3.1 Architecture
<!-- Describe the architecture -->

### 3.2 API Design
<!-- API endpoints, request/response formats -->

### 3.3 Data Model
<!-- Database schema, data structures -->

---

## 4. Implementation Plan

### 4.1 Phases
| Phase | Description | Duration |
|-------|-------------|----------|
| 1 | | |
| 2 | | |

### 4.2 Dependencies
<!-- External dependencies, blockers -->

---

## 5. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| | High | Medium | |

---

## Appendix

### A. References
<!-- Links to related documents -->

### B. Glossary
<!-- Technical terms and definitions -->
```

---

## 10. Organization-Specific Customization

### Step-by-Step: Forking bkit for Your Organization

#### Step 1: Create Your Plugin Structure

```bash
# Create your organization's plugin directory
mkdir -p my-org-plugin/{agents,skills,commands,hooks,templates,scripts}
cd my-org-plugin

# Initialize plugin.json
cat > .claude-plugin/plugin.json << 'EOF'
{
  "name": "my-org-kit",
  "version": "1.0.0",
  "description": "My Organization's Claude Code Plugin",
  "author": {
    "name": "My Organization",
    "email": "dev@myorg.com"
  }
}
EOF
```

#### Step 2: Copy and Customize Components

```bash
# Copy bkit components you want to customize
cp -r ~/.claude/plugins/bkit/agents/starter-guide.md agents/team-guide.md
cp -r ~/.claude/plugins/bkit/skills/bkit-rules skills/org-rules

# Edit to match your organization's needs
```

#### Step 3: Create Organization-Specific Components

**agents/team-lead.md**:
```markdown
---
name: team-lead
description: |
  Senior developer guidance for architecture decisions.
  Use when discussing system design, code reviews, or mentoring.
permissionMode: acceptEdits
model: opus
tools: [Read, Grep, Glob, WebSearch]
---

# Team Lead Agent

## Role
Provide senior-level guidance on architecture and best practices.

## Responsibilities
1. Review architectural decisions
2. Suggest design patterns
3. Identify potential issues early
4. Mentor on best practices
```

#### Step 4: Configure hooks.json

```json
{
  "SessionStart": [
    {
      "once": true,
      "hooks": [
        {
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/hooks/init.sh"
        }
      ]
    }
  ],
  "PreToolUse": {
    "Write(src/**/*.ts)": {
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Ensure TypeScript strict mode compliance."
        }
      ]
    }
  }
}
```

#### Step 5: Register as Private Marketplace

In your project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "my-org": {
      "source": {
        "source": "github",
        "repo": "my-org/claude-plugins"
      }
    }
  },
  "enabledPlugins": {
    "my-org-kit@my-org": true
  }
}
```

### Enterprise Deployment via Managed Settings

For organization-wide deployment, IT administrators can use managed settings:

**macOS**: `/Library/Application Support/ClaudeCode/managed-settings.json`
**Linux**: `/etc/claude-code/managed-settings.json`
**Windows**: `C:\Program Files\ClaudeCode\managed-settings.json`

```json
{
  "strictKnownMarketplaces": ["my-org"],
  "enabledPlugins": {
    "my-org-kit@my-org": true
  },
  "extraKnownMarketplaces": {
    "my-org": {
      "source": {
        "source": "github",
        "repo": "my-org/claude-plugins"
      }
    }
  }
}
```

---

## 11. Best Practices

### Agent Design

1. **Single Responsibility**: Each agent should have one clear purpose
2. **Clear Triggers**: Define explicit trigger conditions in descriptions
3. **Tool Restrictions**: Only include tools the agent actually needs
4. **Multilingual Support**: Include trigger keywords in multiple languages

### Skill Design

1. **Keep SKILL.md Under 500 Lines**: Use supporting files for details
2. **Specific Descriptions**: Help Claude understand when to apply
3. **Use Hooks Sparingly**: Only for critical validation/enforcement

### Command Design

1. **Clear Naming**: Use verbs (`deploy`, `review`, `create`)
2. **Argument Hints**: Provide helpful autocomplete hints
3. **Safe Defaults**: Require confirmation for destructive operations
4. **Informative Output**: Show clear success/failure feedback

### Hook Design

1. **Fast Execution**: Keep hooks under 5 seconds
2. **Silent Success**: Only output on failure/warning
3. **Graceful Degradation**: Don't block if hook fails unexpectedly

### Security Considerations

1. **Never Commit Secrets**: Use environment variables
2. **Validate External Input**: Sanitize command arguments
3. **Restrict Permissions**: Use minimal required tool access
4. **Audit Hooks**: Review all hook scripts for security

---

## Quick Reference

### File Locations Cheatsheet

| Component | Global | Project |
|-----------|--------|---------|
| Settings | `~/.claude/settings.json` | `.claude/settings.json` |
| Instructions | `~/.claude/CLAUDE.md` | `CLAUDE.md` or `.claude/CLAUDE.md` |
| Agents | `~/.claude/agents/` | `.claude/agents/` |
| Skills | `~/.claude/skills/` | `.claude/skills/` |
| Commands | `~/.claude/commands/` | `.claude/commands/` |
| Hooks | Via plugins | `.claude/hooks/hooks.json` |

### Windows-Specific Notes

```powershell
# Access global settings
Get-Content "$env:USERPROFILE\.claude\settings.json"

# Create project config
New-Item -ItemType Directory -Path ".claude\agents" -Force
New-Item -ItemType Directory -Path ".claude\skills" -Force
```

### Useful Commands

```bash
# List available skills
claude /skills

# Check context usage
claude /context

# View installed plugins
claude /plugins

# Debug hooks
CLAUDE_CODE_DEBUG=hooks claude
```

---

## Resources

- [Claude Code Official Documentation](https://code.claude.com/docs/en/settings)
- [Claude Code Skills Guide](https://code.claude.com/docs/en/skills)
- [Agent Skills Open Standard](https://agentskills.io)
- [bkit GitHub Repository](https://github.com/popup-studio-ai/bkit-claude-code)

---

## License & Attribution

### bkit License

bkit is licensed under the **Apache License 2.0**. This means you can:

- **Use** bkit freely in personal and commercial projects
- **Modify** bkit to fit your organization's needs
- **Distribute** your customized versions
- **Sublicense** derivative works under different terms

### Attribution Requirements

When creating derivative works based on bkit, you **must**:

1. **Include the original LICENSE file** or reference to Apache 2.0
2. **Include the NOTICE file** with original attribution
3. **Mark modified files** with prominent notices stating you changed them
4. **Retain copyright notices** from the original source

### NOTICE File Content

When redistributing bkit or derivative works, include:

```
bkit - Vibecoding Kit
Copyright 2024-2026 POPUP STUDIO PTE. LTD.

This product includes software developed by POPUP STUDIO PTE. LTD.
https://github.com/popup-studio-ai/bkit-claude-code

Licensed under the Apache License, Version 2.0
```

### Example Attribution for Derivative Plugins

If you create a plugin based on bkit (e.g., "acme-dev-kit"), add to your `plugin.json`:

```json
{
  "name": "acme-dev-kit",
  "version": "1.0.0",
  "description": "ACME Corp's development kit based on bkit",
  "author": {
    "name": "ACME Corporation",
    "email": "dev@acme.com"
  },
  "license": "Apache-2.0",
  "attribution": {
    "basedOn": "bkit Vibecoding Kit",
    "originalAuthor": "POPUP STUDIO PTE. LTD.",
    "originalRepository": "https://github.com/popup-studio-ai/bkit-claude-code"
  }
}
```

And include a `NOTICE` file in your plugin root:

```
ACME Dev Kit
Copyright 2026 ACME Corporation

This product is based on bkit Vibecoding Kit.
Original work Copyright 2024-2026 POPUP STUDIO PTE. LTD.
https://github.com/popup-studio-ai/bkit-claude-code

Licensed under the Apache License, Version 2.0
http://www.apache.org/licenses/LICENSE-2.0
```

### What You Don't Need to Do

- You don't need to open-source your modifications
- You don't need to use the same license for your additions
- You don't need permission to use bkit commercially

For full license terms, see the [LICENSE](LICENSE) file.

---

## Resources

- [Claude Code Official Documentation](https://code.claude.com/docs/en/settings)
- [Claude Code Skills Guide](https://code.claude.com/docs/en/skills)
- [Agent Skills Open Standard](https://agentskills.io)
- [bkit GitHub Repository](https://github.com/popup-studio-ai/bkit-claude-code)

---

*This guide is part of the bkit Vibecoding Kit. For questions or contributions, visit our [GitHub repository](https://github.com/popup-studio-ai/bkit-claude-code).*
