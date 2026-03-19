import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">🎯 Habit Tracker</h1>
          </Link>
          <Link href="/habits">
            <Button>
              <Plus className="h-4 w-4 mr-2" />새 습관
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
