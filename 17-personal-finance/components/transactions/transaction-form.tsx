'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createTransaction, updateTransaction } from '@/app/actions/transactions'
import { categorizeTransaction } from '@/app/actions/insights'
import { Sparkles, Loader2 } from 'lucide-react'
import type { Category, Transaction } from '@/lib/db/schema'

interface TransactionFormProps {
  categories: Category[]
  transaction?: Transaction
  onSuccess: () => void
}

interface FormData {
  amount: string
  category: string
  description: string
  date: string
  type: 'income' | 'expense'
  paymentMethod: 'cash' | 'card' | 'transfer'
}

export function TransactionForm({
  categories,
  transaction,
  onSuccess,
}: TransactionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isClassifying, setIsClassifying] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    amount: transaction ? transaction.amount : '',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().slice(0, 10),
    type: transaction?.type || 'expense',
    paymentMethod: transaction?.paymentMethod || 'card',
  })

  const handleAIClassify = async () => {
    if (!formData.description.trim()) {
      toast.error('설명을 먼저 입력해주세요')
      return
    }

    setIsClassifying(true)
    const result = await categorizeTransaction(formData.description)

    if (result.success && result.data) {
      setFormData((prev) => ({
        ...prev,
        category: result.data!.suggestedCategory,
      }))
      toast.success(`카테고리 제안: ${result.data.suggestedCategory}`)
    } else {
      toast.error(result.error || '분류에 실패했습니다')
    }
    setIsClassifying(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('올바른 금액을 입력해주세요')
      return
    }

    startTransition(async () => {
      const input = {
        amount,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        type: formData.type,
        paymentMethod: formData.paymentMethod,
      }

      const result = transaction
        ? await updateTransaction(transaction.id, input)
        : await createTransaction(input)

      if (result.success) {
        toast.success(transaction ? '거래가 수정되었습니다' : '거래가 추가되었습니다')
        router.refresh()
        onSuccess()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 유형 선택 */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={formData.type === 'expense' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setFormData((prev) => ({ ...prev, type: 'expense' }))}
        >
          지출
        </Button>
        <Button
          type="button"
          variant={formData.type === 'income' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setFormData((prev) => ({ ...prev, type: 'income' }))}
        >
          수입
        </Button>
      </div>

      {/* 금액 */}
      <div>
        <label className="text-sm font-medium">금액</label>
        <Input
          type="number"
          placeholder="0"
          value={formData.amount}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, amount: e.target.value }))
          }
          required
          min="1"
        />
      </div>

      {/* 설명 */}
      <div>
        <label className="text-sm font-medium">설명</label>
        <div className="flex gap-2">
          <Textarea
            placeholder="거래 내용을 입력하세요"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            required
            rows={2}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAIClassify}
            disabled={isClassifying || isPending}
            title="AI 카테고리 분류"
          >
            {isClassifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* 카테고리 */}
      <div>
        <label className="text-sm font-medium">카테고리</label>
        <Select
          value={formData.category}
          onValueChange={(v) =>
            setFormData((prev) => ({ ...prev, category: v }))
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 날짜 */}
      <div>
        <label className="text-sm font-medium">날짜</label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, date: e.target.value }))
          }
          required
          max={new Date().toISOString().slice(0, 10)}
        />
      </div>

      {/* 결제 수단 */}
      <div>
        <label className="text-sm font-medium">결제 수단</label>
        <Select
          value={formData.paymentMethod}
          onValueChange={(v: 'cash' | 'card' | 'transfer') =>
            setFormData((prev) => ({ ...prev, paymentMethod: v }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="card">카드</SelectItem>
            <SelectItem value="cash">현금</SelectItem>
            <SelectItem value="transfer">이체</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending || isClassifying}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            저장 중...
          </>
        ) : transaction ? (
          '수정'
        ) : (
          '추가'
        )}
      </Button>
    </form>
  )
}
