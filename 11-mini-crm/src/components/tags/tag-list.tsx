'use client';

import { useState } from 'react';
import { Tag } from '@/lib/db/schema';
import { TagCard } from './tag-card';
import { TagDialog } from './tag-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type TagBasic = Pick<Tag, 'id' | 'name' | 'color'>;

type Props = {
  initialTags: TagBasic[];
};

export function TagList({ initialTags }: Props) {
  const [tags, setTags] = useState<TagBasic[]>(initialTags);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagBasic | null>(null);

  const handleCreate = () => {
    setEditingTag(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (tag: TagBasic) => {
    setEditingTag(tag);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 태그를 삭제하시겠습니까? 모든 연결이 해제됩니다.')) return;

    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTags((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert('삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to delete tag:', error);
      alert('삭제 중 오류가 발생했습니다');
    }
  };

  const handleSave = (tag: TagBasic) => {
    if (editingTag) {
      setTags((prev) => prev.map((t) => (t.id === tag.id ? tag : t)));
    } else {
      setTags((prev) => [...prev, tag]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          총 {tags.length}개의 태그
        </p>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />새 태그
        </Button>
      </div>

      {tags.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          태그가 없습니다. 새 태그를 만들어보세요.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <TagDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        tag={editingTag}
        onSave={handleSave}
      />
    </div>
  );
}
