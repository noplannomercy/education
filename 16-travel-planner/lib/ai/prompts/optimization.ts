// lib/ai/prompts/optimization.ts

export interface OptimizationInput {
  tripId: string;
  destination: string;
  itineraries: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    activity: string;
    location?: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
  }>;
  constraints?: {
    budget?: number;
    interests?: string[];
    mobility?: 'high' | 'medium' | 'low';
  };
}

export function buildOptimizationPrompt(input: OptimizationInput): string {
  const completedCount = input.itineraries.filter(i => i.completed).length;
  const pendingCount = input.itineraries.length - completedCount;

  return `당신은 여행 일정 최적화 전문가입니다. 현재 일정을 분석하고 개선 방안을 제안해주세요.

[여행 정보]
목적지: ${input.destination}
총 일정 수: ${input.itineraries.length}개
완료된 일정: ${completedCount}개
남은 일정: ${pendingCount}개

[현재 일정]
${input.itineraries.map((item, idx) => `
${idx + 1}. ${item.date} ${item.startTime}-${item.endTime}
   활동: ${item.activity}
   ${item.location ? `장소: ${item.location}` : ''}
   우선순위: ${item.priority}
   상태: ${item.completed ? '완료' : '예정'}
`).join('\n')}

${input.constraints ? `
[제약 조건]
${input.constraints.budget ? `예산: ${input.constraints.budget.toLocaleString()}원` : ''}
${input.constraints.interests ? `관심사: ${input.constraints.interests.join(', ')}` : ''}
${input.constraints.mobility ? `이동성: ${input.constraints.mobility}` : ''}
` : ''}

[분석 요청사항]
1. 일정 간 충돌 및 비효율 식별
2. 지리적 동선 최적화
3. 시간 배분의 적절성 평가
4. 우선순위에 따른 일정 재배치 제안
5. 빈 시간 활용 방안 제시

CRITICAL: Your response MUST be ONLY valid JSON. Nothing else.
- NO markdown code blocks (no \`\`\`json)
- NO explanatory text before or after the JSON
- NO comments in the JSON
- Start your response with { and end with }
- Ensure all JSON is complete and valid
- severity MUST be one of: "high", "medium", "low" (NOT "critical" or other values)
- priority MUST be one of: "high", "medium", "low"
- Only include fields shown in the example below

Response format (pure JSON only):
{
  "analysis": {
    "conflicts": [
      {
        "itineraryIds": ["id1", "id2"],
        "issue": "시간 중복",
        "severity": "high"
      }
    ],
    "inefficiencies": [
      {
        "date": "2024-03-15",
        "issue": "이동 거리가 너무 김",
        "impact": "2시간 낭비"
      }
    ],
    "suggestions": [
      {
        "priority": "high",
        "type": "reorder",
        "reason": "동선 최적화",
        "expectedImprovement": "1시간 절약"
      }
    ]
  },
  "optimizedSchedule": [
    {
      "itineraryId": "original-id",
      "suggestedDate": "2024-03-15",
      "suggestedStartTime": "10:00",
      "suggestedEndTime": "12:00",
      "reason": "동선 최적화를 위해 순서 변경"
    }
  ],
  "newSuggestions": [
    {
      "date": "2024-03-15",
      "startTime": "14:00",
      "endTime": "16:00",
      "activity": "현지 카페에서 휴식",
      "location": "홍대 카페거리",
      "reason": "빈 시간 활용",
      "estimatedCost": 15000,
      "priority": "low"
    }
  ],
  "summary": "전체 최적화 요약 (2-3문장)"
}`;
}
