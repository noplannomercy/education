// lib/ai/prompts/budget.ts

export interface BudgetInput {
  tripId: string;
  destination: string;
  country: string;
  duration: number;
  totalBudget: number;
  actualSpent: number;
  travelers: number;
  expenses: Array<{
    category: string;
    amount: number;
    description: string;
    date: string;
  }>;
}

export function buildBudgetPrompt(input: BudgetInput): string {
  const remaining = input.totalBudget - input.actualSpent;
  const remainingDays = input.duration; // 실제로는 계산 필요
  const dailyBudget = Math.floor(remaining / remainingDays);

  // 카테고리별 지출 집계
  const categoryTotals: Record<string, number> = {};
  input.expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  return `당신은 여행 예산 관리 전문가입니다. 현재 여행의 지출 내역을 분석하고 예산 최적화 방안을 제안해주세요.

[여행 정보]
목적지: ${input.destination}, ${input.country}
여행 기간: ${input.duration}일
총 예산: ${input.totalBudget.toLocaleString()}원
실제 지출: ${input.actualSpent.toLocaleString()}원
잔여 예산: ${remaining.toLocaleString()}원
인원: ${input.travelers}명

[카테고리별 지출]
${Object.entries(categoryTotals).map(([cat, amount]) =>
  `${getCategoryLabel(cat)}: ${amount.toLocaleString()}원 (${Math.round(amount / input.actualSpent * 100)}%)`
).join('\n')}

[최근 지출 내역] (최대 10개)
${input.expenses.slice(-10).map(exp =>
  `- ${exp.date}: ${exp.description} (${getCategoryLabel(exp.category)}, ${exp.amount.toLocaleString()}원)`
).join('\n')}

[요구사항]
1. 현재 지출 패턴 분석
2. 예산 초과 위험이 있는 카테고리 식별
3. 남은 기간 동안의 예산 배분 제안
4. 절약 가능한 항목과 방법 제시
5. 우선순위 조정 제안

YOU MUST respond with ONLY valid JSON.
No markdown code blocks (no \`\`\`json).
No preamble or explanation.
Just pure JSON.

JSON 형식:
{
  "analysis": {
    "overallStatus": "on_track | over_budget | under_budget",
    "spendingRate": 85.5,
    "projectedTotal": 1850000,
    "riskLevel": "low | medium | high"
  },
  "categoryAnalysis": [
    {
      "category": "food",
      "spent": 400000,
      "budgeted": 350000,
      "remaining": -50000,
      "status": "over_budget",
      "recommendation": "점심은 로컬 식당 이용 권장"
    }
  ],
  "recommendations": [
    {
      "priority": "high",
      "category": "food",
      "action": "점심 예산 줄이기",
      "expectedSavings": 100000,
      "difficulty": "easy"
    }
  ],
  "optimizedBudget": {
    "transport": 280000,
    "accommodation": 450000,
    "food": 350000,
    "activities": 320000,
    "shopping": 150000,
    "emergency": 50000
  },
  "tips": [
    "대중교통 이용 시 30% 절약 가능",
    "점심 시간대 레스토랑 런치 세트 추천"
  ]
}`;
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    transport: '교통',
    accommodation: '숙박',
    food: '식비',
    activity: '액티비티',
    shopping: '쇼핑',
    other: '기타',
  };
  return labels[category] || category;
}
