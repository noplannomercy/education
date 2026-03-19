import { getTransactions } from '@/app/actions/transactions'
import { getCategories } from '@/app/actions/categories'
import { TransactionDialog } from '@/components/transactions/transaction-dialog'
import { TransactionList } from '@/components/transactions/transaction-list'
import { EmptyState } from '@/components/shared/empty-state'
import { Receipt } from 'lucide-react'

export async function TransactionsTab() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">거래 내역</h2>
        <TransactionDialog categories={categories} />
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="거래 내역이 없습니다"
          description="새 거래를 추가해보세요"
        />
      ) : (
        <TransactionList transactions={transactions} categories={categories} />
      )}
    </div>
  )
}
