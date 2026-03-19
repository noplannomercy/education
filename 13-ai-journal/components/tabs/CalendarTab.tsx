'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/calendar/Calendar';
import { JournalCard } from '@/components/journal/JournalCard';
import { EmotionDisplay } from '@/components/journal/EmotionDisplay';
import { getJournalDatesInMonth, getJournalByDate, deleteJournal } from '@/actions/journal';
import { formatDateKR } from '@/lib/date-utils';
import { toast } from 'sonner';

export function CalendarTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [journalDates, setJournalDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedJournal, setSelectedJournal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadJournalDates = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const dates = await getJournalDatesInMonth(year, month);
    setJournalDates(dates);
  };

  useEffect(() => {
    loadJournalDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  async function handleDateSelect(date: string) {
    setSelectedDate(date);
    setIsLoading(true);

    const journal = await getJournalByDate(date);
    setSelectedJournal(journal);
    setIsLoading(false);
  }

  async function handleDelete() {
    if (!selectedJournal) return;

    if (!confirm('정말 삭제하시겠습니까?')) return;

    const result = await deleteJournal(selectedJournal.id);
    if (result.success) {
      toast.success('일기가 삭제되었습니다');
      setSelectedJournal(null);
      setSelectedDate(undefined);
      loadJournalDates();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <div>
        <Calendar
          journalDates={journalDates}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      </div>

      {/* Selected journal */}
      <div>
        {isLoading && (
          <div className="text-center py-8 text-gray-500">
            로딩 중...
          </div>
        )}

        {!isLoading && selectedDate && !selectedJournal && (
          <div className="rounded-lg border p-8 text-center text-gray-500">
            <p className="mb-4">{formatDateKR(selectedDate)}</p>
            <p>이 날짜에 작성된 일기가 없습니다</p>
          </div>
        )}

        {!isLoading && selectedJournal && (
          <div className="space-y-4">
            <JournalCard
              journal={selectedJournal}
              onDelete={handleDelete}
            />

            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(selectedJournal as any).emotionAnalysis && (
              <EmotionDisplay
                emotion={
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (selectedJournal as any).emotionAnalysis
                }
                summary={selectedJournal.summary || undefined}
              />
            )}
          </div>
        )}

        {!selectedDate && (
          <div className="rounded-lg border p-8 text-center text-gray-500">
            날짜를 선택하여 일기를 확인하세요
          </div>
        )}
      </div>
    </div>
  );
}
