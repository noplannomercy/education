import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';

// KST 기준 오늘 날짜 (YYYY-MM-DD 형식)
export function getTodayKST(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 주간 범위 계산 (월요일 ~ 일요일)
export function getWeekRange(date: Date): { start: string; end: string } {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // 월요일 시작
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // 일요일 종료

  return {
    start: format(weekStart, 'yyyy-MM-dd'),
    end: format(weekEnd, 'yyyy-MM-dd'),
  };
}

// 날짜 포맷 (한국어)
export function formatDateKR(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy년 M월 d일 (E)', { locale: ko });
}

// 날짜 포맷 (간단한 형식)
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'M/d (E)', { locale: ko });
}
