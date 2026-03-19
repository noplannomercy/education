// Pipeline stages
export const PIPELINE_STAGES = [
  { id: 'lead', label: '리드', color: '#94a3b8' },
  { id: 'qualified', label: '검증됨', color: '#60a5fa' },
  { id: 'proposal', label: '제안', color: '#a78bfa' },
  { id: 'negotiation', label: '협상', color: '#fb923c' },
  { id: 'closed_won', label: '성사', color: '#4ade80' },
  { id: 'closed_lost', label: '실패', color: '#f87171' },
] as const;

// Activity types
export const ACTIVITY_TYPES = {
  call: { label: '전화', icon: '📞' },
  email: { label: '이메일', icon: '✉️' },
  meeting: { label: '미팅', icon: '🤝' },
  note: { label: '메모', icon: '📝' },
} as const;

// Priority levels
export const PRIORITY_LEVELS = {
  low: { label: '낮음', color: '#94a3b8' },
  medium: { label: '보통', color: '#fb923c' },
  high: { label: '높음', color: '#f87171' },
} as const;

// Format currency
export function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

// Format currency short (for large amounts)
export function formatCurrencyShort(amount: number): string {
  if (amount >= 100000000) {
    return `₩${(amount / 100000000).toFixed(1)}억`;
  }
  if (amount >= 10000) {
    return `₩${(amount / 10000).toFixed(0)}만`;
  }
  return formatCurrency(amount);
}
