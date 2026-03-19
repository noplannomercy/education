'use client';

import { Task } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { ko } from 'date-fns/locale';

type TaskWithRelations = Task & {
  contact: { id: string; name: string } | null;
  company: { id: string; name: string } | null;
  deal: { id: string; title: string } | null;
};

type Props = {
  task: TaskWithRelations;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

const priorityColors = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300',
};

const priorityLabels = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
}: Props) {
  const isCompleted = task.isCompleted;
  const isOverdue =
    task.dueDate && !isCompleted && isPast(new Date(task.dueDate));
  const isDueToday =
    task.dueDate && !isCompleted && isToday(new Date(task.dueDate));
  const isDueTomorrow =
    task.dueDate && !isCompleted && isTomorrow(new Date(task.dueDate));

  const getDueDateLabel = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);

    if (isOverdue) {
      return (
        <span className="flex items-center gap-1 text-red-600 font-semibold">
          <AlertCircle className="h-4 w-4" />
          기한 초과
        </span>
      );
    }
    if (isDueToday) {
      return (
        <span className="flex items-center gap-1 text-orange-600 font-semibold">
          <Clock className="h-4 w-4" />
          오늘까지
        </span>
      );
    }
    if (isDueTomorrow) {
      return (
        <span className="flex items-center gap-1 text-blue-600">
          <Clock className="h-4 w-4" />
          내일까지
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-gray-600">
        <Clock className="h-4 w-4" />
        {format(date, 'PPP', { locale: ko })}
      </span>
    );
  };

  return (
    <Card
      className={`p-4 ${isCompleted ? 'opacity-60 bg-gray-50' : ''} ${
        isOverdue ? 'border-l-4 border-l-red-500' : ''
      } ${isDueToday ? 'border-l-4 border-l-orange-500' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={() => onToggleComplete(task.id)}
            className="mt-1 flex-shrink-0"
          >
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={`text-xs ${priorityColors[task.priority]}`}
              >
                {priorityLabels[task.priority]}
              </Badge>
              {isCompleted && (
                <Badge variant="secondary" className="text-xs">
                  완료
                </Badge>
              )}
            </div>

            <h3
              className={`font-semibold text-gray-900 mb-1 ${
                isCompleted ? 'line-through text-gray-500' : ''
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm">
              {task.dueDate && getDueDateLabel()}

              {task.contact && (
                <span className="flex items-center gap-1 text-gray-500">
                  👤 {task.contact.name}
                </span>
              )}

              {task.company && (
                <span className="flex items-center gap-1 text-gray-500">
                  🏢 {task.company.name}
                </span>
              )}

              {task.deal && (
                <span className="flex items-center gap-1 text-gray-500">
                  💰 {task.deal.title}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
