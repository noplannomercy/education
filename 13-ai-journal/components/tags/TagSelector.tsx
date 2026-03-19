'use client';

import { useState, useEffect } from 'react';
import type { Tag } from '@/db/schema';
import { getAllTags, createTag } from '@/actions/tag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagToggle: (tag: Tag) => void;
}

export function TagSelector({ selectedTags, onTagToggle }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function loadTags() {
      const tags = await getAllTags();
      setAllTags(tags);
    }
    loadTags();
  }, []);

  async function loadTags() {
    const tags = await getAllTags();
    setAllTags(tags);
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) {
      toast.error('태그 이름을 입력해주세요');
      return;
    }

    setIsCreating(true);
    const result = await createTag(newTagName.trim());
    setIsCreating(false);

    if (result.success) {
      toast.success('태그가 생성되었습니다');
      setNewTagName('');
      await loadTags();
      onTagToggle(result.data);
    } else {
      toast.error(result.error);
    }
  }

  const selectedTagIds = new Set(selectedTags.map(t => t.id));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => {
          const isSelected = selectedTagIds.has(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => onTagToggle(tag)}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              #{tag.name}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCreateTag();
            }
          }}
          placeholder="새 태그 이름"
          className="flex-1"
        />
        <Button
          onClick={handleCreateTag}
          disabled={isCreating}
          size="sm"
        >
          추가
        </Button>
      </div>
    </div>
  );
}
