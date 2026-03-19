import type { Tag } from '@/db/schema';
import { Badge } from '@/components/ui/badge';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
}

export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  return (
    <Badge
      style={{ backgroundColor: tag.color }}
      className="text-white"
    >
      #{tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-gray-200"
        >
          ×
        </button>
      )}
    </Badge>
  );
}
