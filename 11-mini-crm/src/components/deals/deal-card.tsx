'use client';

import { Deal } from '@/lib/db/schema';
import { formatCurrency } from '@/lib/constants';
import { Card } from '@/components/ui/card';

interface DealCardProps {
  deal: Deal;
  isDragging?: boolean;
}

export function DealCard({ deal, isDragging }: DealCardProps) {
  return (
    <Card
      data-testid={`deal-${deal.id}`}
      className={`
        p-3 cursor-grab active:cursor-grabbing
        ${isDragging ? 'shadow-lg ring-2 ring-blue-400' : 'shadow-sm hover:shadow-md'}
        transition-shadow
      `}
    >
      <div className="space-y-2">
        <h3 className="font-medium text-sm">{deal.title}</h3>
        <p className="text-sm font-semibold text-green-600">
          {formatCurrency(deal.amount)}
        </p>
        {deal.expectedCloseDate && (
          <p className="text-xs text-gray-500">
            마감: {new Date(deal.expectedCloseDate).toLocaleDateString('ko-KR')}
          </p>
        )}
      </div>
    </Card>
  );
}
