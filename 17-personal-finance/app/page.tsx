import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardTab } from '@/components/tabs/dashboard-tab'
import { TransactionsTab } from '@/components/tabs/transactions-tab'
import { BudgetTab } from '@/components/tabs/budget-tab'
import { CategoriesTab } from '@/components/tabs/categories-tab'
import { InsightsTab } from '@/components/tabs/insights-tab'
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Tags,
  Lightbulb,
} from 'lucide-react'

export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">AI Personal Finance</h1>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">대시보드</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">거래</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            <span className="hidden sm:inline">예산</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            <span className="hidden sm:inline">카테고리</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">AI 인사이트</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="transactions">
          <TransactionsTab />
        </TabsContent>
        <TabsContent value="budget">
          <BudgetTab />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="insights">
          <InsightsTab />
        </TabsContent>
      </Tabs>
    </main>
  )
}
