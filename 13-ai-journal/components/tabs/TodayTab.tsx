'use client';

import { useState, useEffect } from 'react';
import { getJournalByDate, deleteJournal } from '@/actions/journal';
import { getTodayKST, formatDateKR } from '@/lib/date-utils';
import { JournalEditor } from '@/components/journal/JournalEditor';
import { JournalCard } from '@/components/journal/JournalCard';
import { EmotionDisplay } from '@/components/journal/EmotionDisplay';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type TodayJournal = Awaited<ReturnType<typeof getJournalByDate>>;

export function TodayTab() {
  const [todayJournal, setTodayJournal] = useState<TodayJournal>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTodayJournal() {
      setIsLoading(true);
      const journal = await getJournalByDate(getTodayKST());
      setTodayJournal(journal);
      setIsLoading(false);
    }
    loadTodayJournal();
  }, []);

  async function loadTodayJournal() {
    setIsLoading(true);
    const journal = await getJournalByDate(getTodayKST());
    setTodayJournal(journal);
    setIsLoading(false);
  }

  async function handleDelete() {
    if (!todayJournal) return;

    if (!confirm('정말 삭제하시겠습니까?')) return;

    const result = await deleteJournal(todayJournal.id);
    if (result.success) {
      toast.success('일기가 삭제되었습니다');
      setTodayJournal(null);
      setIsEditing(false);
    } else {
      toast.error(result.error);
    }
  }

  function handleSaved() {
    setIsEditing(false);
    loadTodayJournal();
  }

  function handleAnalyzed() {
    loadTodayJournal();
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{formatDateKR(getTodayKST())}</h2>
        {todayJournal && !isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            수정
          </Button>
        )}
      </div>

      {!todayJournal || isEditing ? (
        <JournalEditor
          journalId={todayJournal?.id}
          initialTitle={todayJournal?.title}
          initialContent={todayJournal?.content}
          initialDate={todayJournal?.date || getTodayKST()}
          initialTags={
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (todayJournal as any)?.journalTags?.map((jt: any) => jt.tag) || []
          }
          onSaved={handleSaved}
          onAnalyzed={handleAnalyzed}
        />
      ) : (
        <>
          <JournalCard
            journal={todayJournal}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
          />

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(todayJournal as any).emotionAnalysis && (
            <EmotionDisplay
              emotion={
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (todayJournal as any).emotionAnalysis
              }
              summary={todayJournal.summary || undefined}
            />
          )}
        </>
      )}

      {isEditing && todayJournal && (
        <Button
          variant="ghost"
          onClick={() => setIsEditing(false)}
          className="w-full"
        >
          취소
        </Button>
      )}
    </div>
  );
}
