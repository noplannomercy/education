import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Moon } from 'lucide-react'
import { DreamForm } from '@/components/dreams/dream-form'
import { DreamList } from '@/components/dreams/dream-list'
import { CalendarView } from '@/components/calendar/calendar-view'
import { StatsView } from '@/components/stats/stats-view'
import { InterpretationView } from '@/components/interpretation/interpretation-view'
import { PatternsView } from '@/components/patterns/patterns-view'
import { getRecentDreams, getAllDreams } from '@/lib/actions/dreams'

export default async function Home() {
  // Fetch recent dreams on the server
  const recentDreams = await getRecentDreams(10)
  // Fetch all dreams for calendar
  const allDreams = await getAllDreams()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Moon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">AI Dream Journal</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            AI 기반 꿈 일기 애플리케이션
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="today">오늘</TabsTrigger>
            <TabsTrigger value="calendar">캘린더</TabsTrigger>
            <TabsTrigger value="stats">통계</TabsTrigger>
            <TabsTrigger value="interpretation">해석</TabsTrigger>
            <TabsTrigger value="patterns">패턴</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <DreamForm />
            <DreamList dreams={recentDreams} />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <CalendarView dreams={allDreams} />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <StatsView dreams={allDreams} />
          </TabsContent>

          <TabsContent value="interpretation" className="space-y-4">
            <InterpretationView dreams={allDreams} />
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <PatternsView dreams={allDreams} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
