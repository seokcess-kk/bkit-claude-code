#!/usr/bin/env node
/**
 * iterator-stop.js - Guide next iteration or completion after pdca-iterator (v1.3.1)
 *
 * Purpose: Detect completion status and provide next step guidance
 * Hook: Stop for pdca-iterator agent
 * Core component of Check-Act iteration loop
 *
 * Converted from: scripts/iterator-stop.sh
 */

const { readStdinSync, outputAllow, generateTaskGuidance } = require('../lib/common.js');

// Read conversation context from stdin
const input = readStdinSync();
const inputText = typeof input === 'string' ? input : JSON.stringify(input);

// Patterns for detection
const completionPattern = /(완료|Complete|Completed|>= 90%|매치율.*9[0-9]%|Match Rate.*9[0-9]%|passed|성공|Successfully)/i;
const maxIterationPattern = /(max.*iteration|최대.*반복|5\/5|limit reached)/i;
const improvedPattern = /(improved|개선|수정.*완료|fixed)/i;

let guidance = '';

// Check if completed successfully
if (completionPattern.test(inputText)) {
  guidance = `✅ pdca-iterator 완료!

설계-구현 일치도가 목표(90%)에 도달했습니다.

다음 단계:
1. **/pdca-report** 로 완료 보고서 생성
2. 변경사항 리뷰 후 커밋
3. Archive 진행 (선택)

🎉 Check-Act 반복 성공!`;

} else if (maxIterationPattern.test(inputText)) {
  // Max iterations reached
  guidance = `⚠️ pdca-iterator: 최대 반복 횟수 도달

자동 개선이 5회 반복되었지만 목표에 도달하지 못했습니다.

권장 조치:
1. 수동으로 남은 차이점 수정
2. 또는 설계 문서를 현재 구현에 맞게 업데이트
3. /pdca-analyze 로 현재 상태 재확인

💡 복잡한 차이는 수동 개입이 필요할 수 있습니다.`;

} else if (improvedPattern.test(inputText)) {
  // Improvement made but not complete
  guidance = `🔄 pdca-iterator 진행 중

수정이 완료되었습니다. 재평가가 필요합니다.

다음 단계:
1. **/pdca-analyze** {feature} 로 재평가 실행
2. 매치율 확인 후 필요시 반복

💡 90% 이상 도달까지 Check-Act를 반복하세요.`;

} else {
  // Default: suggest re-evaluation
  guidance = `🔄 pdca-iterator 작업 완료

수정 작업이 완료되었습니다.

다음 단계:
1. **/pdca-analyze** 로 재평가하여 매치율 확인
2. 90% 미만이면 /pdca-iterate 재실행
3. 90% 이상이면 /pdca-report 로 완료 보고서 생성`;
}

// Add Task System guidance for PDCA workflow (v1.3.1 - FR-05)
const isComplete = completionPattern.test(inputText);
const taskGuidance = isComplete
  ? 'Task: Mark current [Act] task as completed. Proceed to /pdca-report.'
  : generateTaskGuidance('act', 'feature', 'check');

// Output guidance with Task System hint
const fullGuidance = `${guidance}\n\n${taskGuidance}`.replace(/\n/g, ' ').replace(/\s+/g, ' ');
outputAllow(fullGuidance);
