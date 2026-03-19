// lib/ai/utils/parseJSON.ts

/**
 * AI 응답에서 JSON을 안전하게 파싱합니다.
 * - 마크다운 코드 블록 제거 (```json ... ```)
 * - 전후 텍스트 제거 (preamble/conclusion)
 * - 후행 쉼표 제거
 * - 주석 제거
 * - 잘린 JSON 복구 시도
 */
export function parseAIResponse<T>(text: string): T {
  let cleaned = text.trim();

  // 마크다운 코드 블록 제거
  if (cleaned.includes('```')) {
    // ```json\n{...}\n``` 또는 ```\n{...}\n``` 형식
    const match = cleaned.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (match) {
      cleaned = match[1].trim();
    } else {
      // 닫는 ``` 만 찾아서 제거
      cleaned = cleaned.replace(/^```(?:json)?\s*\n/, '').replace(/\n```$/, '');
    }
  }

  // JSON 객체 추출 (전후 텍스트 제거)
  // "Here's your plan: {...}" -> "{...}"
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }

  // 후행 쉼표 제거 (JSON에서 허용되지 않음)
  // { "key": "value", } -> { "key": "value" }
  // [ "item", ] -> [ "item" ]
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  // 주석 제거 (// 또는 /* */ 형식)
  cleaned = cleaned.replace(/\/\/.*$/gm, ''); // 한 줄 주석
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, ''); // 여러 줄 주석

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    // JSON이 잘린 경우 복구 시도
    if (error instanceof SyntaxError && error.message.includes('Unexpected end')) {
      console.warn('잘린 JSON 감지, 복구 시도 중...');

      // 마지막 완전한 객체/배열까지만 사용
      let truncated = cleaned;

      // 열린 괄호 수 계산
      let braceCount = 0;
      let lastValidIndex = -1;

      for (let i = 0; i < truncated.length; i++) {
        if (truncated[i] === '{' || truncated[i] === '[') {
          braceCount++;
        } else if (truncated[i] === '}' || truncated[i] === ']') {
          braceCount--;
          if (braceCount === 0) {
            lastValidIndex = i;
          }
        }
      }

      if (lastValidIndex > 0) {
        truncated = truncated.substring(0, lastValidIndex + 1);
        try {
          return JSON.parse(truncated) as T;
        } catch {
          // 복구 실패, 원래 에러 던지기
        }
      }
    }

    console.error('JSON 파싱 실패:', error);
    console.error('원본 텍스트 길이:', text.length);
    console.error('원본 텍스트 미리보기:', text.substring(0, 200));
    console.error('정리된 텍스트 길이:', cleaned.length);
    console.error('정리된 텍스트 미리보기:', cleaned.substring(0, 200));
    throw new Error(`AI 응답을 JSON으로 파싱할 수 없습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * AI 응답이 유효한 JSON인지 확인합니다.
 */
export function isValidJSON(text: string): boolean {
  try {
    parseAIResponse(text);
    return true;
  } catch {
    return false;
  }
}
