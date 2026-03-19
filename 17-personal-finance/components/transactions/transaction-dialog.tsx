'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TransactionForm } from './transaction-form'
import { Plus } from 'lucide-react'
import type { Category, Transaction } from '@/lib/db/schema'

interface TransactionDialogProps {
  categories: Category[]
  transaction?: Transaction
  trigger?: React.ReactNode
}

export function TransactionDialog({
  categories,
  transaction,
  trigger,
}: TransactionDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            새 거래
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? '거래 수정' : '새 거래 추가'}</DialogTitle>
        </DialogHeader>
        <TransactionForm
          categories={categories}
          transaction={transaction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
