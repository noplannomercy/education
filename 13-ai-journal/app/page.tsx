'use client';

import { TodayTab } from '@/components/tabs/TodayTab';
import { CalendarTab } from '@/components/tabs/CalendarTab';
import { StatsTab } from '@/components/tabs/StatsTab';
import { InsightTab } from '@/components/tabs/InsightTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">오늘</TabsTrigger>
          <TabsTrigger value="calendar">캘린더</TabsTrigger>
          <TabsTrigger value="stats">통계</TabsTrigger>
          <TabsTrigger value="insight">인사이트</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          <TodayTab />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <CalendarTab />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <StatsTab />
        </TabsContent>

        <TabsContent value="insight" className="mt-6">
          <InsightTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
