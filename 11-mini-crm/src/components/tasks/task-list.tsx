'use client';

import { useState } from 'react';
import { Task } from '@/lib/db/schema';
import { TaskCard } from './task-card';
import { TaskDialog } from './task-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TaskWithRelations = Task & {
  contact: { id: string; name: string } | null;
  company: { id: string; name: string } | null;
  deal: { id: string; title: string } | null;
};

type Props = {
  initialTasks: TaskWithRelations[];
  contacts: { id: string; name: string }[];
  companies: { id: string; name: string }[];
  deals: { id: string; title: string }[];
};

export function TaskList({
  initialTasks,
  contacts,
  companies,
  deals,
}: Props) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(
    null
  );
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreate = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (task: TaskWithRelations) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 태스크를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert('삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('삭제 중 오류가 발생했습니다');
    }
  };

  const handleToggleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}/complete`, {
        method: 'PATCH',
      });

      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
        );
      } else {
        alert('상태 변경에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
      alert('상태 변경 중 오류가 발생했습니다');
    }
  };

  const handleSave = async (task: TaskWithRelations) => {
    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    } else {
      setTasks((prev) => [task, ...prev]);
    }
    setIsDialogOpen(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (priorityFilter !== 'all' && task.priority !== priorityFilter)
      return false;
    if (statusFilter === 'completed' && !task.isCompleted) return false;
    if (statusFilter === 'pending' && task.isCompleted) return false;
    return true;
  });

  const pendingTasks = filteredTasks.filter((t) => !t.isCompleted);
  const completedTasks = filteredTasks.filter((t) => t.isCompleted);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="우선순위" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 우선순위</SelectItem>
                <SelectItem value="high">높음</SelectItem>
                <SelectItem value="medium">보통</SelectItem>
                <SelectItem value="low">낮음</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="pending">진행 중</SelectItem>
              <SelectItem value="completed">완료</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />새 태스크
        </Button>
      </div>

      <div className="space-y-8">
        {pendingTasks.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              진행 중 ({pendingTasks.length})
            </h2>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              완료됨 ({completedTasks.length})
            </h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            태스크가 없습니다
          </div>
        )}
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        onSave={handleSave}
        contacts={contacts}
        companies={companies}
        deals={deals}
      />
    </div>
  );
}
