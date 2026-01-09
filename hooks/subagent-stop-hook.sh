#!/bin/bash
# bkit SubagentStop Hook - Subagent task completion evaluation
# Returns JSON: {"decision": "approve|block", "reason": "..."}

set -euo pipefail

# Subagents typically complete focused tasks
# Default to approve unless specific conditions require blocking

echo '{"decision": "approve", "reason": "Subagent task complete"}'
exit 0
