'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { TransactionDialog } from './transaction-dialog'
import { deleteTransaction } from '@/app/actions/transactions'
import { toast } from 'sonner'
import { Pencil, Trash2, CreditCard, Banknote, ArrowRightLeft } from 'lucide-react'
import type { Category, Transaction } from '@/lib/db/schema'

interface TransactionCardProps {
  transaction: Transaction
  categories: Category[]
}

const paymentIcons = {
  card: CreditCard,
  cash: Banknote,
  transfer: ArrowRightLeft,
}

export function TransactionCard({ transaction, categories }: TransactionCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const PaymentIcon = paymentIcons[transaction.paymentMethod]

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTransaction(transaction.id)
      if (result.success) {
        toast.success('거래가 삭제되었습니다')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <PaymentIcon
                className={`h-4 w-4 ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              />
            </div>
            <div>
              <p className="font-medium">{transaction.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{transaction.category}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`font-semibold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {Number(transaction.amount).toLocaleString()}원
            </span>

            <TransactionDialog
              categories={categories}
              transaction={transaction}
              trigger={
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />

            <ConfirmDialog
              title="거래 삭제"
              description="이 거래를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
              onConfirm={handleDelete}
            >
              <Button variant="ghost" size="icon" disabled={isPending}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </ConfirmDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
