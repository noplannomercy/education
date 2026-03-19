import { z } from 'zod';

export const emotionResponseSchema = z.object({
  primaryEmotion: z.string().min(1),
  emotionScore: z.number().min(1).max(10),
  emotions: z.object({
    happiness: z.number().min(0).max(10),
    sadness: z.number().min(0).max(10),
    anger: z.number().min(0).max(10),
    anxiety: z.number().min(0).max(10),
    calm: z.number().min(0).max(10),
    gratitude: z.number().min(0).max(10),
  }),
  keywords: z.array(z.string()).min(1).max(5),
});

export type EmotionResponse = z.infer<typeof emotionResponseSchema>;
