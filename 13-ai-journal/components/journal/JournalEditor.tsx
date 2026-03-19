'use client';

import { useState, useEffect } from 'react';
import type { Tag } from '@/db/schema';
import { createJournal, updateJournal } from '@/actions/journal';
import { assignTagToJournal, removeTagFromJournal } from '@/actions/tag';
import { analyzeJournalEmotion } from '@/actions/emotion';
import { getTodayKST } from '@/lib/date-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagSelector } from '@/components/tags/TagSelector';
import { TagBadge } from '@/components/tags/TagBadge';
import { toast } from 'sonner';

interface JournalEditorProps {
  journalId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialDate?: string;
  initialTags?: Tag[];
  onSaved?: () => void;
  onAnalyzed?: () => void;
}

export function JournalEditor({
  journalId,
  initialTitle = '',
  initialContent = '',
  initialDate = getTodayKST(),
  initialTags = [],
  onSaved,
  onAnalyzed,
}: JournalEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [date, setDate] = useState(initialDate);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [currentJournalId, setCurrentJournalId] = useState(journalId);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setDate(initialDate);
    setSelectedTags(initialTags);
    setCurrentJournalId(journalId);
  }, [initialTitle, initialContent, initialDate, initialTags, journalId]);

  async function handleSave() {
    if (!title.trim()) {
      toast.error('제목을 입력해주세요');
      return;
    }

    if (!content.trim()) {
      toast.error('내용을 입력해주세요');
      return;
    }

    setIsSaving(true);

    try {
      let result;

      if (journalId) {
        // Update existing journal
        result = await updateJournal(journalId, {
          title: title.trim(),
          content: content.trim(),
          date,
        });
      } else {
        // Create new journal
        result = await createJournal({
          title: title.trim(),
          content: content.trim(),
          date,
        });
      }

      if (!result.success) {
        toast.error(result.error);
        setIsSaving(false);
        return;
      }

      const savedJournalId = result.data.id;
      setCurrentJournalId(savedJournalId);

      // Handle tags
      if (journalId) {
        // For updates, we need to sync tags
        const currentTagIds = new Set(selectedTags.map(t => t.id));
        const initialTagIds = new Set(initialTags.map(t => t.id));

        // Remove tags that were unselected
        for (const tag of initialTags) {
          if (!currentTagIds.has(tag.id)) {
            await removeTagFromJournal(journalId, tag.id);
          }
        }

        // Add new tags
        for (const tag of selectedTags) {
          if (!initialTagIds.has(tag.id)) {
            await assignTagToJournal(journalId, tag.id);
          }
        }
      } else {
        // For new journals, just assign all selected tags
        for (const tag of selectedTags) {
          await assignTagToJournal(savedJournalId, tag.id);
        }
      }

      toast.success(journalId ? '일기가 수정되었습니다' : '일기가 저장되었습니다');
      onSaved?.();
    } catch (error) {
      console.error('Save journal error:', error);
      toast.error('저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  }

  function handleTagToggle(tag: Tag) {
    setSelectedTags(prev => {
      const exists = prev.find(t => t.id === tag.id);
      if (exists) {
        return prev.filter(t => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  }

  function handleRemoveTag(tagId: string) {
    setSelectedTags(prev => prev.filter(t => t.id !== tagId));
  }

  async function handleAnalyze() {
    if (!title.trim() || !content.trim()) {
      toast.error('일기를 먼저 작성해주세요');
      return;
    }

    // If journal is not saved yet, save it first
    if (!currentJournalId) {
      toast.info('일기를 먼저 저장합니다...');
      await handleSave();
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await analyzeJournalEmotion(currentJournalId, content);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('AI 분석이 완료되었습니다!');
      onAnalyzed?.();
    } catch (error) {
      console.error('Analyze error:', error);
      toast.error('AI 분석에 실패했습니다');
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{journalId ? '일기 수정' : '새 일기 작성'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">날짜</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">제목</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="오늘 하루를 정리하며"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">내용</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘 하루는 어땠나요?"
            className="mt-1 min-h-[200px]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">태그</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTagSelector(!showTagSelector)}
            >
              {showTagSelector ? '닫기' : '태그 선택'}
            </Button>
          </div>

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map(tag => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  onRemove={() => handleRemoveTag(tag.id)}
                />
              ))}
            </div>
          )}

          {showTagSelector && (
            <TagSelector
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
            />
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || isAnalyzing}
            className="flex-1"
          >
            {isSaving ? '저장 중...' : '저장'}
          </Button>
          <Button
            variant="outline"
            onClick={handleAnalyze}
            disabled={isAnalyzing || isSaving}
          >
            {isAnalyzing ? '🤖 분석 중...' : '🤖 AI 분석하기'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
