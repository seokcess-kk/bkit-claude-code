#!/bin/bash
# bkit Stop Hook - PDCA completion evaluation
# Returns JSON: {"decision": "approve|block", "reason": "..."}

set -euo pipefail

# Read input from stdin (contains session info)
input=$(cat)

# Extract transcript path if available
transcript_path=$(echo "$input" | grep -o '"transcript_path":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")

# Default: approve (allow Claude to stop)
decision="approve"
reason="Task evaluation complete"

# If transcript exists, check for incomplete todos
if [ -n "$transcript_path" ] && [ -f "$transcript_path" ]; then
    # Check if there are in_progress todos in the last few messages
    if tail -100 "$transcript_path" 2>/dev/null | grep -q '"status":"in_progress"'; then
        decision="block"
        reason="There are still in-progress tasks in the todo list. Please complete them before stopping."
    fi
fi

# Output JSON response
echo "{\"decision\": \"$decision\", \"reason\": \"$reason\"}"
exit 0
