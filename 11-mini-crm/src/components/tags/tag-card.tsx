'use client';

import { Tag } from '@/lib/db/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Tag as TagIcon } from 'lucide-react';

type TagBasic = Pick<Tag, 'id' | 'name' | 'color'>;

type Props = {
  tag: TagBasic;
  onEdit: (tag: TagBasic) => void;
  onDelete: (id: string) => void;
};

export function TagCard({ tag, onEdit, onDelete }: Props) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: tag.color }}
          >
            <TagIcon className="h-4 w-4 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {tag.name}
            </h3>
            <p className="text-xs text-gray-500 font-mono">
              {tag.color}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(tag)}
          >
            <Edit className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(tag.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
