'use client';

import { Activity } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Circle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

type ActivityWithRelations = Activity & {
  contact: { id: string; name: string } | null;
  company: { id: string; name: string } | null;
  deal: { id: string; title: string } | null;
};

type Props = {
  activity: ActivityWithRelations;
  onEdit: (activity: ActivityWithRelations) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
};

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
};

const activityLabels = {
  call: '통화',
  email: '이메일',
  meeting: '미팅',
  note: '노트',
};

const activityColors = {
  call: 'bg-blue-100 text-blue-700',
  email: 'bg-purple-100 text-purple-700',
  meeting: 'bg-green-100 text-green-700',
  note: 'bg-gray-100 text-gray-700',
};

export function ActivityCard({
  activity,
  onEdit,
  onDelete,
  onComplete,
}: Props) {
  const Icon = activityIcons[activity.type];
  const isCompleted = !!activity.completedAt;

  return (
    <Card className={`p-4 ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`mt-1 rounded-full p-2 ${activityColors[activity.type]}`}
          >
            <Icon className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {activityLabels[activity.type]}
              </Badge>
              {isCompleted && (
                <Badge variant="secondary" className="text-xs">
                  완료
                </Badge>
              )}
            </div>

            <h3 className="font-semibold text-gray-900 mb-1">
              {activity.title}
            </h3>

            {activity.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {activity.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {activity.scheduledAt && (
                <span>
                  {format(new Date(activity.scheduledAt), 'PPP p', {
                    locale: ko,
                  })}
                </span>
              )}

              {activity.contact && (
                <span className="flex items-center gap-1">
                  👤 {activity.contact.name}
                </span>
              )}

              {activity.company && (
                <span className="flex items-center gap-1">
                  🏢 {activity.company.name}
                </span>
              )}

              {activity.deal && (
                <span className="flex items-center gap-1">
                  💰 {activity.deal.title}
                </span>
              )}
            </div>

            {activity.completedAt && (
              <p className="text-xs text-gray-500 mt-2">
                완료: {format(new Date(activity.completedAt), 'PPP p', { locale: ko })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComplete(activity.id)}
              title="완료 처리"
            >
              <Circle className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(activity)}
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(activity.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
