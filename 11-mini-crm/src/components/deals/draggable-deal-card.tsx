'use client';

import { useDraggable } from '@dnd-kit/core';
import { Deal } from '@/lib/db/schema';
import { DealCard } from './deal-card';

interface DraggableDealCardProps {
  deal: Deal;
}

export function DraggableDealCard({ deal }: DraggableDealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: deal.id,
    data: {
      deal,
    },
  });

  const style = {
    visibility: isDragging ? ('hidden' as const) : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <DealCard deal={deal} isDragging={false} />
    </div>
  );
}
