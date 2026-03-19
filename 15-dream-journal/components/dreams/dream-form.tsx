'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createDream } from '@/lib/actions/dreams'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

type DreamFormData = {
  title: string
  content: string
  date: string
  emotion: 'positive' | 'neutral' | 'negative'
  vividness: number
  lucid: boolean
}

export function DreamForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DreamFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      emotion: 'neutral',
      vividness: 3,
      lucid: false,
    },
  })

  const onSubmit = async (data: DreamFormData) => {
    setIsSubmitting(true)
    setMessage(null)

    try {
      await createDream({
        ...data,
        date: new Date(data.date),
      })
      setMessage('꿈 기록이 저장되었습니다!')
      reset()
    } catch (error) {
      setMessage('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>오늘의 꿈 기록하기</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">제목</Label>
            <Input id="title" {...register('title')} placeholder="꿈의 제목" />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="꿈의 내용을 자세히 기록해주세요..."
              rows={6}
            />
            {errors.content && (
              <p className="text-sm text-destructive mt-1">
                {errors.content.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="date">날짜</Label>
            <Input id="date" type="date" {...register('date')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emotion">감정</Label>
              <select
                id="emotion"
                {...register('emotion')}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="positive">긍정적</option>
                <option value="neutral">중립</option>
                <option value="negative">부정적</option>
              </select>
            </div>

            <div>
              <Label htmlFor="vividness">생생함 (1-5)</Label>
              <Input
                id="vividness"
                type="number"
                min="1"
                max="5"
                {...register('vividness', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="lucid"
              type="checkbox"
              {...register('lucid')}
              className="h-4 w-4"
            />
            <Label htmlFor="lucid">자각몽</Label>
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.includes('저장') ? 'text-green-600' : 'text-destructive'
              }`}
            >
              {message}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? '저장 중...' : '꿈 기록 저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
