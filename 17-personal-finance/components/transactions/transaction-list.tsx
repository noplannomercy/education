'use client'

import { TransactionCard } from './transaction-card'
import type { Category, Transaction } from '@/lib/db/schema'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
}

export function TransactionList({ transactions, categories }: TransactionListProps) {
  // 날짜별로 그룹화
  const grouped = transactions.reduce(
    (acc, tx) => {
      const date = tx.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(tx)
      return acc
    },
    {} as Record<string, Transaction[]>
  )

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, txList]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            {formatDate(date)}
          </h3>
          <div className="space-y-2">
            {txList.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} categories={categories} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = weekdays[date.getDay()]
  return `${month}월 ${day}일 (${weekday})`
}
