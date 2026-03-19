import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Emotion emoji mapping
const emotionEmojis: Record<string, string> = {
  행복: '😊',
  슬픔: '😢',
  분노: '😠',
  불안: '😰',
  평온: '😌',
  감사: '🙏',
  기대: '🤩',
  성취: '🎉',
  사랑: '❤️',
  외로움: '😔',
  피곤: '😫',
  설렘: '🥰',
  즐거움: '😄',
  만족: '😊',
  희망: '✨',
  자신감: '💪',
};

export function getEmotionEmoji(emotion: string): string {
  return emotionEmojis[emotion] || '😐'; // 기본값
}
