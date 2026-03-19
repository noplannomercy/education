export const EMOTION_ANALYSIS_PROMPT = (content: string) => `당신은 감정 분석 전문가입니다. 다음 일기를 읽고 감정을 분석해주세요.

[일기 내용]
${content}

**중요**:
1. 반드시 순수한 JSON만 출력하세요. 설명이나 다른 텍스트를 포함하지 마세요.
2. emotionScore는 반드시 1~10 사이의 정수여야 합니다 (1이 최소, 10이 최대).
3. emotions의 각 항목은 0~10 사이의 정수여야 합니다.
4. keywords는 1~5개의 핵심 키워드를 배열로 제공하세요.

JSON 형식:
{
  "primaryEmotion": "감사",
  "emotionScore": 8,
  "emotions": {
    "happiness": 7,
    "sadness": 2,
    "anger": 0,
    "anxiety": 1,
    "calm": 6,
    "gratitude": 9
  },
  "keywords": ["성취", "감사", "기쁨"]
}`;

export const SUMMARY_PROMPT = (content: string) => `당신은 요약 전문가입니다.

다음 일기를 2-3문장으로 핵심만 요약해주세요:

[일기 내용]
${content}

요약:`;

export const WEEKLY_INSIGHT_PROMPT = (journals: string) => `당신은 심리 상담 전문가입니다.

다음은 한 주간의 일기입니다. 전체적인 감정 패턴과 인사이트를 제공해주세요.

[일기 목록]
${journals}

다음을 포함해서 분석해주세요:
1. 이번 주 전반적인 감정 상태
2. 감정 변화 패턴
3. 긍정적인 점
4. 개선할 점 (부드럽게)
5. 다음 주를 위한 제안`;
