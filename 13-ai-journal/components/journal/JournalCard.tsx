'use client';

import type { JournalEntry } from '@/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TagBadge } from '@/components/tags/TagBadge';
import { formatDateKR } from '@/lib/date-utils';
import { Pencil, Trash2 } from 'lucide-react';

interface JournalCardProps {
  journal: JournalEntry & {
    emotionAnalysis?: {
      primaryEmotion: string;
      emotionScore: number;
      keywords: string[];
    } | null;
    journalTags?: Array<{ tag: { id: string; name: string; color: string } }>;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export function JournalCard({ journal, onEdit, onDelete }: JournalCardProps) {
  const tags = journal.journalTags?.map(jt => jt.tag) || [];
  const emotion = journal.emotionAnalysis;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{journal.title}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {formatDateKR(journal.date)}
            </p>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {emotion && (
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-sm font-medium">
              {emotion.primaryEmotion} ({emotion.emotionScore}/10)
            </p>
            {emotion.keywords && emotion.keywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {emotion.keywords.map((keyword: string, i: number) => (
                  <span
                    key={i}
                    className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {journal.summary && (
          <p className="text-sm text-gray-700">{journal.summary}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
