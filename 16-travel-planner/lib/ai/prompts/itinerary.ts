// lib/ai/prompts/itinerary.ts

export interface ItineraryInput {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  tripType: 'vacation' | 'business' | 'adventure' | 'backpacking';
  preferences?: string[];
}

export function buildItineraryPrompt(input: ItineraryInput): string {
  const duration = calculateDays(input.startDate, input.endDate);
  const budgetPerDay = Math.floor(input.budget / duration);
  const budgetPerPerson = Math.floor(input.budget / input.travelers);

  return `당신은 전문 여행 계획가입니다. 다음 정보를 바탕으로 최적의 여행 일정을 생성해주세요.

[여행 정보]
목적지: ${input.destination}, ${input.country}
기간: ${input.startDate} ~ ${input.endDate} (${duration}일)
예산: ${input.budget.toLocaleString()}원 (1일당 약 ${budgetPerDay.toLocaleString()}원, 1인당 ${budgetPerPerson.toLocaleString()}원)
인원: ${input.travelers}명
여행 유형: ${getTripTypeLabel(input.tripType)}
${input.preferences && input.preferences.length > 0 ? `선호 사항: ${input.preferences.join(', ')}` : ''}

[요구사항]
1. ${duration}일간의 구체적인 일정을 작성해주세요
2. 각 날짜별로 테마와 주요 활동을 포함해주세요
3. 시간대별로 활동을 배치하고 예상 비용을 명시해주세요
4. 예산 배분 (교통, 숙박, 식비, 액티비티)을 제안해주세요
5. 여행 팁 3-5개를 추가해주세요

CRITICAL: Your response MUST be ONLY valid JSON. Nothing else.
- NO markdown code blocks (no \`\`\`json)
- NO explanatory text before or after the JSON
- NO comments in the JSON
- Start your response with { and end with }
- Ensure all JSON is complete and valid
- ALL fields in the example below are REQUIRED (including all budgetBreakdown fields)
- Use 0 for any budget categories that don't apply

Response format (pure JSON only):
{
  "dailyPlans": [
    {
      "date": "YYYY-MM-DD",
      "dayNumber": 1,
      "theme": "도착 및 시내 탐방",
      "activities": [
        {
          "time": "09:00",
          "duration": 120,
          "activity": "공항 도착 및 호텔 체크인",
          "location": "인천국제공항",
          "estimatedCost": 50000,
          "priority": "high",
          "notes": "사전 온라인 체크인 권장"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "transport": 300000,
    "accommodation": 500000,
    "food": 400000,
    "activities": 300000,
    "shopping": 200000,
    "emergency": 100000
  },
  "tips": [
    "현지 교통카드 구매 시 20% 할인",
    "점심 시간대 레스토랑 런치 세트 이용 추천"
  ]
}`;
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function getTripTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    vacation: '휴가',
    business: '출장',
    adventure: '모험',
    backpacking: '배낭여행',
  };
  return labels[type] || type;
}
