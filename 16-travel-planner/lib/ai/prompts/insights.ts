// lib/ai/prompts/insights.ts

export interface InsightsInput {
  tripId: string;
  tripName: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: 'planning' | 'ongoing' | 'completed';
  budget: number;
  actualSpent: number;
  travelers: number;
  tripType: string;
  itinerariesCount: number;
  completedItineraries: number;
  expensesCount: number;
  topExpenseCategory?: string;
}

export function buildInsightsPrompt(input: InsightsInput): string {
  const progress = input.itinerariesCount > 0
    ? Math.round((input.completedItineraries / input.itinerariesCount) * 100)
    : 0;
  const budgetUsage = Math.round((input.actualSpent / input.budget) * 100);

  return `당신은 여행 데이터 분석 전문가입니다. 다음 여행 정보를 분석하고 인사이트를 제공해주세요.

[여행 개요]
여행명: ${input.tripName}
목적지: ${input.destination}, ${input.country}
기간: ${input.startDate} ~ ${input.endDate} (${input.duration}일)
상태: ${getStatusLabel(input.status)}
인원: ${input.travelers}명
유형: ${input.tripType}

[예산 정보]
총 예산: ${input.budget.toLocaleString()}원
실제 지출: ${input.actualSpent.toLocaleString()}원
예산 사용률: ${budgetUsage}%
${input.topExpenseCategory ? `주요 지출 카테고리: ${input.topExpenseCategory}` : ''}

[일정 정보]
총 일정: ${input.itinerariesCount}개
완료된 일정: ${input.completedItineraries}개
진행률: ${progress}%
총 지출 건수: ${input.expensesCount}건

[요청사항]
1. 전체 여행 진행 상황 평가
2. 예산 사용 패턴 분석
3. 일정 완료율 평가
4. 여행 스타일 및 선호도 분석
5. 개선 가능한 영역 식별
6. 다음 여행을 위한 추천사항

YOU MUST respond with ONLY valid JSON.
No markdown code blocks (no \`\`\`json).
No preamble or explanation.
Just pure JSON.

JSON 형식:
{
  "overallScore": 85,
  "highlights": [
    "예산 관리 우수",
    "일정 진행률 양호",
    "다양한 액티비티 경험"
  ],
  "concerns": [
    "교통비 지출이 예상보다 높음",
    "일부 일정 미완료"
  ],
  "budgetInsights": {
    "efficiency": "good | average | poor",
    "comparison": "similar_trips_average",
    "savingsOpportunities": [
      {
        "category": "transport",
        "potentialSavings": 100000,
        "suggestion": "대중교통 패스 구매"
      }
    ]
  },
  "travelStyle": {
    "pace": "fast | moderate | slow",
    "preferences": ["문화", "음식", "자연"],
    "budgetLevel": "budget | mid-range | luxury"
  },
  "recommendations": [
    {
      "category": "planning",
      "priority": "high",
      "suggestion": "다음 여행에서는 사전 예약 활용",
      "expectedBenefit": "시간 절약, 비용 10% 절감"
    }
  ],
  "nextTripSuggestions": {
    "similarDestinations": ["교토", "타이페이", "방콕"],
    "budgetEstimate": 1800000,
    "bestTimeToVisit": "봄(3-5월) 또는 가을(9-11월)",
    "tips": [
      "항공권은 3개월 전 예매 권장",
      "숙소는 도심 외곽이 가성비 좋음"
    ]
  },
  "summary": "전체 여행 평가 요약 (3-4문장)"
}`;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    planning: '계획 중',
    ongoing: '진행 중',
    completed: '완료',
  };
  return labels[status] || status;
}
