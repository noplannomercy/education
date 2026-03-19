// JSON 응답 강제 지시문
const JSON_INSTRUCTION = `
YOU MUST respond with ONLY valid JSON.
No markdown code blocks.
No preamble.
Just pure JSON.`

interface TransactionData {
  date: string
  category: string
  description: string
  amount: number
  type: 'income' | 'expense'
}

interface MonthlyStats {
  income: number
  expense: number
  byCategory: Record<string, number>
}

// 지출 분석 프롬프트
export function buildSpendingAnalysisPrompt(
  transactions: TransactionData[],
  stats: MonthlyStats
): string {
  const txSummary = transactions
    .filter((t) => t.type === 'expense')
    .map((t) => `${t.date}: ${t.category} - ${t.description} (${t.amount}원)`)
    .join('\n')

  return `당신은 한국어를 사용하는 개인 재무 분석 전문가입니다.
다음 지출 내역을 분석해주세요.

## 월간 요약
- 총 수입: ${stats.income.toLocaleString()}원
- 총 지출: ${stats.expense.toLocaleString()}원
- 저축: ${(stats.income - stats.expense).toLocaleString()}원

## 카테고리별 지출
${Object.entries(stats.byCategory)
  .map(([cat, amount]) => `- ${cat}: ${amount.toLocaleString()}원`)
  .join('\n')}

## 상세 거래 내역
${txSummary}

다음 JSON 형식으로 분석 결과를 제공해주세요:
{
  "summary": "전체 지출 패턴에 대한 요약 (한국어, 2-3문장)",
  "topSpending": [
    { "category": "카테고리명", "amount": 금액, "percentage": 비율 }
  ],
  "unnecessarySpending": [
    { "description": "불필요한 지출 설명", "amount": 금액, "suggestion": "절약 제안" }
  ],
  "savingOpportunities": ["절약 기회 1", "절약 기회 2"],
  "trends": ["지출 트렌드 1", "지출 트렌드 2"]
}
${JSON_INSTRUCTION}`
}

// 예산 제안 프롬프트
export function buildBudgetSuggestionPrompt(
  income: number,
  categories: string[],
  historicalStats?: MonthlyStats
): string {
  const historyPart = historicalStats
    ? `
## 과거 지출 패턴
- 총 지출: ${historicalStats.expense.toLocaleString()}원
${Object.entries(historicalStats.byCategory)
  .map(([cat, amount]) => `- ${cat}: ${amount.toLocaleString()}원`)
  .join('\n')}`
    : ''

  return `당신은 한국어를 사용하는 개인 재무 컨설턴트입니다.
다음 정보를 기반으로 월 예산을 제안해주세요.

## 사용자 정보
- 월 수입: ${income.toLocaleString()}원
- 사용 가능한 카테고리: ${categories.join(', ')}
${historyPart}

다음 JSON 형식으로 예산 제안을 제공해주세요:
{
  "totalBudget": 총예산금액,
  "categoryBudgets": {
    "카테고리1": 금액,
    "카테고리2": 금액
  },
  "savingsTarget": 저축목표금액,
  "insights": ["인사이트 1", "인사이트 2"]
}

참고: 총예산과 카테고리별 예산 합계는 수입의 80-90%를 넘지 않도록 해주세요.
${JSON_INSTRUCTION}`
}

// 카테고리 분류 프롬프트
export function buildCategorizationPrompt(
  description: string,
  categories: string[]
): string {
  return `당신은 거래 내역을 분류하는 전문가입니다.
다음 거래 설명을 보고 가장 적합한 카테고리를 선택해주세요.

## 거래 설명
"${description}"

## 사용 가능한 카테고리
${categories.map((c) => `- ${c}`).join('\n')}

다음 JSON 형식으로 응답해주세요:
{
  "suggestedCategory": "선택한 카테고리명",
  "confidence": 0.0~1.0 사이의 확신도,
  "reasoning": "이 카테고리를 선택한 이유 (한국어, 1문장)"
}
${JSON_INSTRUCTION}`
}

// 이상 거래 감지 프롬프트
export function buildAnomalyDetectionPrompt(
  transactions: TransactionData[],
  averageByCategory: Record<string, number>
): string {
  const txList = transactions
    .map((t) => `${t.date}: ${t.category} - ${t.description} (${t.amount}원)`)
    .join('\n')

  return `당신은 금융 이상 거래를 감지하는 전문가입니다.
다음 거래 내역에서 비정상적인 패턴을 찾아주세요.

## 카테고리별 평균 지출
${Object.entries(averageByCategory)
  .map(([cat, avg]) => `- ${cat}: ${avg.toLocaleString()}원`)
  .join('\n')}

## 이번 달 거래 내역
${txList}

다음 JSON 형식으로 응답해주세요:
{
  "anomalies": [
    {
      "description": "이상 거래 설명",
      "amount": 금액,
      "date": "YYYY-MM-DD",
      "reason": "이상으로 판단한 이유",
      "severity": "low" | "medium" | "high"
    }
  ],
  "summary": "전체 이상 거래 요약 (한국어)",
  "recommendation": "권고 사항 (한국어)"
}

이상 거래가 없으면 anomalies를 빈 배열로 반환하세요.
${JSON_INSTRUCTION}`
}

// 저축 조언 프롬프트
export function buildSavingsAdvicePrompt(params: {
  income: number
  expenses: number
  savingsGoal: number
  timeframeMonths: number
  currentSavings?: number
}): string {
  const { income, expenses, savingsGoal, timeframeMonths, currentSavings = 0 } = params

  return `당신은 한국어를 사용하는 저축 전문 재무 상담사입니다.
다음 정보를 기반으로 저축 조언을 제공해주세요.

## 사용자 재무 상황
- 월 수입: ${income.toLocaleString()}원
- 월 지출: ${expenses.toLocaleString()}원
- 현재 저축액: ${currentSavings.toLocaleString()}원
- 저축 목표: ${savingsGoal.toLocaleString()}원
- 목표 기간: ${timeframeMonths}개월

## 계산된 정보
- 월 잉여금: ${(income - expenses).toLocaleString()}원
- 필요 월 저축액: ${Math.ceil((savingsGoal - currentSavings) / timeframeMonths).toLocaleString()}원

다음 JSON 형식으로 저축 조언을 제공해주세요:
{
  "currentSavings": ${currentSavings},
  "requiredMonthlySavings": 필요월저축액,
  "gap": 현재저축과필요저축의차이,
  "feasibility": "easy" | "moderate" | "challenging" | "difficult",
  "strategies": [
    {
      "action": "구체적인 절약 방법",
      "potentialSavings": 예상절약금액,
      "difficulty": "easy" | "medium" | "hard"
    }
  ],
  "projectedSavings": {
    "3개월": 3개월후예상저축액,
    "6개월": 6개월후예상저축액,
    "12개월": 12개월후예상저축액
  },
  "motivation": "동기부여 메시지 (한국어)"
}
${JSON_INSTRUCTION}`
}
