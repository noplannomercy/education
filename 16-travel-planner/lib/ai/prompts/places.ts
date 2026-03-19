// lib/ai/prompts/places.ts

export interface PlacesInput {
  destination: string;
  country: string;
  category?: 'attraction' | 'restaurant' | 'accommodation' | 'shopping' | 'activity';
  budget?: number;
  preferences?: string[];
  count?: number;
}

export function buildPlacesPrompt(input: PlacesInput): string {
  return `당신은 현지 여행 전문가입니다. ${input.destination}, ${input.country}의 ${getCategoryLabel(input.category)}를 추천해주세요.

[요구사항]
목적지: ${input.destination}, ${input.country}
${input.category ? `카테고리: ${getCategoryLabel(input.category)}` : '모든 카테고리'}
${input.budget ? `예산: ${input.budget.toLocaleString()}원` : ''}
${input.preferences && input.preferences.length > 0 ? `선호 사항: ${input.preferences.join(', ')}` : ''}
추천 수: ${input.count || 5}개

[장소 선정 기준]
1. 현지인들이 추천하는 숨은 명소 포함
2. 가성비가 좋은 곳 우선
3. 대중교통 접근성이 좋은 곳
4. 최신 정보 기반 (2024-2025년)
${input.budget ? `5. 예산 범위 내에서 선택` : ''}

YOU MUST respond with ONLY valid JSON.
No markdown code blocks (no \`\`\`json).
No preamble or explanation.
Just pure JSON.

JSON 형식:
{
  "places": [
    {
      "name": "장소 이름",
      "category": "attraction",
      "description": "상세 설명 (2-3문장)",
      "address": "주소",
      "averageCost": 15000,
      "recommendedDuration": 120,
      "openingHours": "09:00-18:00",
      "rating": 4.5,
      "tips": [
        "평일 오전 방문 추천",
        "사전 예약 필수"
      ],
      "nearbyTransport": "지하철 2호선 강남역 3번 출구",
      "bestTime": "오전 10시-12시"
    }
  ],
  "summary": "추천 이유 요약 (2-3문장)"
}`;
}

function getCategoryLabel(category?: string): string {
  if (!category) return '장소';

  const labels: Record<string, string> = {
    attraction: '관광지',
    restaurant: '음식점',
    accommodation: '숙박',
    shopping: '쇼핑',
    activity: '액티비티',
  };
  return labels[category] || category;
}
