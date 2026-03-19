import { generateObject } from 'ai'
import { z } from 'zod'
import { model } from './config'
import { callAIWithRetry } from '@/lib/error-handler'
import type { Dream } from '@/lib/db/schema'

// ========================================
// 1. interpretDream - 꿈 해석
// ========================================

const interpretationSchema = z.object({
  interpretation: z.string(),
  psychological: z.string(),
  symbolic: z.string(),
  message: z.string(),
})

export type InterpretationResult = z.infer<typeof interpretationSchema>

export async function interpretDream(
  content: string,
  emotion: string,
  vividness: number
): Promise<InterpretationResult> {
  return callAIWithRetry(async () => {
    const result = await generateObject({
      model,
      schema: interpretationSchema,
      prompt: `당신은 꿈 해석 전문가이자 심리학자입니다.

다음 꿈을 분석하고, 반드시 JSON 형식으로 응답해주세요:

내용: ${content}
감정: ${emotion}
생생함: ${vividness}/5

다음 4가지 관점에서 해석하여 JSON 객체로 응답하세요:
{
  "interpretation": "전체적인 해석 (2-3문장)",
  "psychological": "심리학적 관점 - 프로이트, 융 등의 이론 적용 (2-3문장)",
  "symbolic": "상징적 의미 - 주요 상징의 의미 설명 (2-3문장)",
  "message": "이 꿈이 전하는 메시지 - 실용적 조언 포함 (2-3문장)"
}`,
    })

    return result.object
  })
}

// ========================================
// 2. extractSymbols - 상징 추출
// ========================================

const symbolSchema = z.object({
  symbols: z.array(
    z.object({
      symbol: z.string(),
      category: z.enum(['person', 'place', 'object', 'action', 'emotion']),
      meaning: z.string(),
    })
  ),
})

export type SymbolResult = z.infer<typeof symbolSchema>['symbols'][number]

export async function extractSymbols(content: string): Promise<SymbolResult[]> {
  return callAIWithRetry(async () => {
    const result = await generateObject({
      model,
      schema: symbolSchema,
      prompt: `당신은 꿈 상징 분석 전문가입니다.

다음 꿈에서 의미 있는 상징들을 추출하고, 반드시 JSON 형식으로 응답해주세요:

${content}

다음 JSON 형식으로 응답하세요:
{
  "symbols": [
    {
      "symbol": "상징 이름",
      "category": "person|place|object|action|emotion",
      "meaning": "이 상징의 일반적 의미 (1-2문장)"
    }
  ]
}

상징 추출 기준:
- person: 사람, 동물
- place: 위치, 환경
- object: 사물
- action: 주요 행위
- emotion: 강한 감정`,
    })

    return result.object.symbols
  })
}

// ========================================
// 3. detectPatterns - 패턴 발견
// ========================================

const patternSchema = z.object({
  patterns: z.array(
    z.object({
      type: z.enum(['theme', 'person', 'place', 'emotion']),
      name: z.string(),
      description: z.string(),
      occurrences: z.number(),
      significance: z.string(),
    })
  ),
})

export type PatternResult = z.infer<typeof patternSchema>['patterns'][number]

export async function detectPatterns(dreams: Dream[]): Promise<PatternResult[]> {
  return callAIWithRetry(async () => {
    const dreamsText = dreams
      .map((d) => `날짜: ${d.date}, 제목: ${d.title}, 내용: ${d.content}`)
      .join('\n\n')

    const result = await generateObject({
      model,
      schema: patternSchema,
      prompt: `당신은 꿈 패턴 분석 전문가입니다.

다음은 최근 꿈들의 목록입니다:

${dreamsText}

반복되는 패턴을 찾고, 반드시 JSON 형식으로 응답해주세요:

다음 JSON 형식으로 응답하세요:
{
  "patterns": [
    {
      "type": "theme|person|place|emotion",
      "name": "패턴 이름",
      "description": "패턴에 대한 설명 (1-2문장)",
      "occurrences": 반복 횟수(숫자),
      "significance": "이 패턴의 의미와 해석 (2-3문장)"
    }
  ]
}

패턴 유형:
- theme: 반복되는 주제
- person: 자주 나오는 사람/동물
- place: 반복되는 장소
- emotion: 일관된 감정`,
    })

    return result.object.patterns
  })
}

// ========================================
// 4. generateWeeklyInsight - 주간 인사이트
// ========================================

const insightSchema = z.object({
  summary: z.string(),
  mainThemes: z.array(z.string()),
  emotionalFlow: z.string(),
  subconscious: z.string(),
  nextWeek: z.string(),
})

export type WeeklyInsightResult = z.infer<typeof insightSchema>

export async function generateWeeklyInsight(
  dreams: Dream[]
): Promise<WeeklyInsightResult> {
  return callAIWithRetry(async () => {
    const dreamsText = dreams
      .map((d) => `${d.date}: ${d.title} (${d.emotion})`)
      .join('\n')

    const result = await generateObject({
      model,
      schema: insightSchema,
      prompt: `당신은 꿈 분석 전문가입니다.

이번 주 꿈들을 분석하고, 반드시 JSON 형식으로 응답해주세요:

${dreamsText}

다음 JSON 형식으로 응답하세요:
{
  "summary": "한 주 꿈의 전반적인 요약 (2-3문장)",
  "mainThemes": ["주요 테마 1", "주요 테마 2", "주요 테마 3"],
  "emotionalFlow": "한 주간의 감정 변화와 흐름 분석 (2-3문장)",
  "subconscious": "잠재의식이 전하는 메시지 (2-3문장)",
  "nextWeek": "다음 주에 주목해야 할 포인트 (2-3문장)"
}

친근하고 통찰력 있는 톤으로 작성해주세요.`,
    })

    return result.object
  })
}
