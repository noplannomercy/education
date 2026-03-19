'use client';

import { useState } from 'react';
import { Activity } from '@/lib/db/schema';
import { ActivityCard } from './activity-card';
import { ActivityDialog } from './activity-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ActivityWithRelations = Activity & {
  contact: { id: string; name: string } | null;
  company: { id: string; name: string } | null;
  deal: { id: string; title: string } | null;
};

type Props = {
  initialActivities: ActivityWithRelations[];
  contacts: { id: string; name: string }[];
  companies: { id: string; name: string }[];
  deals: { id: string; title: string }[];
};

export function ActivityList({
  initialActivities,
  contacts,
  companies,
  deals,
}: Props) {
  const [activities, setActivities] =
    useState<ActivityWithRelations[]>(initialActivities);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] =
    useState<ActivityWithRelations | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreate = () => {
    setEditingActivity(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (activity: ActivityWithRelations) => {
    setEditingActivity(activity);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 활동을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setActivities((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert('삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to delete activity:', error);
      alert('삭제 중 오류가 발생했습니다');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/activities/${id}/complete`, {
        method: 'PATCH',
      });

      if (res.ok) {
        const updated = await res.json();
        setActivities((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
        );
      } else {
        alert('완료 처리에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to complete activity:', error);
      alert('완료 처리 중 오류가 발생했습니다');
    }
  };

  const handleSave = async (activity: ActivityWithRelations) => {
    if (editingActivity) {
      setActivities((prev) =>
        prev.map((a) => (a.id === activity.id ? activity : a))
      );
    } else {
      setActivities((prev) => [activity, ...prev]);
    }
    setIsDialogOpen(false);
  };

  const filteredActivities = activities.filter((activity) => {
    if (typeFilter !== 'all' && activity.type !== typeFilter) return false;
    if (statusFilter === 'completed' && !activity.completedAt) return false;
    if (statusFilter === 'pending' && activity.completedAt) return false;
    return true;
  });

  const pendingActivities = filteredActivities.filter((a) => !a.completedAt);
  const completedActivities = filteredActivities.filter((a) => a.completedAt);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 유형</SelectItem>
                <SelectItem value="call">통화</SelectItem>
                <SelectItem value="email">이메일</SelectItem>
                <SelectItem value="meeting">미팅</SelectItem>
                <SelectItem value="note">노트</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="pending">예정/진행</SelectItem>
              <SelectItem value="completed">완료</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />새 활동
        </Button>
      </div>

      <div className="space-y-8">
        {pendingActivities.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              예정/진행 중 ({pendingActivities.length})
            </h2>
            <div className="space-y-3">
              {pendingActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          </div>
        )}

        {completedActivities.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              완료됨 ({completedActivities.length})
            </h2>
            <div className="space-y-3">
              {completedActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          </div>
        )}

        {filteredActivities.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            활동이 없습니다
          </div>
        )}
      </div>

      <ActivityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        activity={editingActivity}
        onSave={handleSave}
        contacts={contacts}
        companies={companies}
        deals={deals}
      />
    </div>
  );
}
