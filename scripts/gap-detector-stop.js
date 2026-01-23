#!/usr/bin/env node
/**
 * gap-detector-stop.js - Parse gap analysis result and guide next steps (v1.3.1)
 *
 * Purpose: Parse match rate and provide guidance for Check-Act iteration
 * Hook: Stop for gap-detector agent
 * Core component of Check-Act iteration loop
 *
 * Converted from: scripts/gap-detector-stop.sh
 */

const { readStdinSync, outputAllow, generateTaskGuidance } = require('../lib/common.js');

// Read conversation context from stdin
const input = readStdinSync();
const inputText = typeof input === 'string' ? input : JSON.stringify(input);

// Try to extract match rate from the agent's output
// Patterns: "Overall Match Rate: XX%", "매치율: XX%", "Match Rate: XX%", "일치율: XX%"
const matchRatePattern = /(Overall|Match Rate|매치율|일치율|Design Match)[^0-9]*(\d+)/i;
const match = inputText.match(matchRatePattern);
let matchRate = match ? parseInt(match[2], 10) : 0;

// Generate guidance based on match rate thresholds
let guidance = '';

if (matchRate >= 90) {
  guidance = `✅ Gap Analysis 완료: ${matchRate}% 매치

설계-구현이 잘 일치합니다.

다음 단계:
1. /pdca-report 로 완료 보고서 생성
2. Archive 진행 가능 (docs/archive/로 이동)

🎉 PDCA Check 단계 통과!`;

} else if (matchRate >= 70) {
  guidance = `⚠️ Gap Analysis 완료: ${matchRate}% 매치

일부 차이가 있습니다. 선택하세요:

1. **수동 수정**: 직접 차이점 수정
2. **/pdca-iterate**: 자동 개선 실행 (권장)
3. **설계 업데이트**: 구현에 맞게 설계 문서 수정
4. **의도적 차이**: 차이를 기록으로 남김

💡 90% 이상 도달 시 완료 보고서 생성 가능`;

} else {
  guidance = `🔴 Gap Analysis 완료: ${matchRate}% 매치

설계-구현 차이가 큽니다.

권장 조치:
1. **/pdca-iterate** 실행하여 자동 개선 (강력 권장)
2. 또는 설계 문서를 현재 구현에 맞게 전면 업데이트

⚠️ Check-Act 반복이 필요합니다. 90% 이상 도달까지 반복하세요.`;
}

// Add Task System guidance for PDCA workflow (v1.3.1 - FR-04)
const taskGuidance = matchRate >= 90
  ? generateTaskGuidance('check', 'feature', 'do')
  : generateTaskGuidance('act', 'feature', 'check');

// Output guidance with Task System hint
const fullGuidance = `${guidance}\n\n${taskGuidance}`.replace(/\n/g, ' ').replace(/\s+/g, ' ');
outputAllow(fullGuidance);
