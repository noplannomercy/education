'use client';

import { useState, useEffect } from 'react';
import { Activity } from '@/lib/db/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: ActivityWithRelations | null;
  onSave: (activity: ActivityWithRelations) => void;
  contacts: { id: string; name: string }[];
  companies: { id: string; name: string }[];
  deals: { id: string; title: string }[];
};

export function ActivityDialog({
  open,
  onOpenChange,
  activity,
  onSave,
  contacts,
  companies,
  deals,
}: Props) {
  const [formData, setFormData] = useState({
    type: 'call' as 'call' | 'email' | 'meeting' | 'note',
    title: '',
    description: '',
    scheduledAt: '',
    contactId: '',
    companyId: '',
    dealId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type,
        title: activity.title,
        description: activity.description || '',
        scheduledAt: activity.scheduledAt
          ? new Date(activity.scheduledAt).toISOString().slice(0, 16)
          : '',
        contactId: activity.contactId || '',
        companyId: activity.companyId || '',
        dealId: activity.dealId || '',
      });
    } else {
      setFormData({
        type: 'call',
        title: '',
        description: '',
        scheduledAt: '',
        contactId: '',
        companyId: '',
        dealId: '',
      });
    }
    setErrors({});
  }, [activity, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.title.trim()) {
      setErrors({ title: '제목은 필수입니다' });
      return;
    }

    if (!formData.contactId && !formData.companyId && !formData.dealId) {
      setErrors({ contactId: '연락처, 회사, 거래 중 최소 하나는 연결해야 합니다' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type: formData.type,
        title: formData.title,
        description: formData.description || null,
        scheduledAt: formData.scheduledAt
          ? new Date(formData.scheduledAt).toISOString()
          : null,
        contactId: formData.contactId || null,
        companyId: formData.companyId || null,
        dealId: formData.dealId || null,
      };

      const url = activity
        ? `/api/activities/${activity.id}`
        : '/api/activities';
      const method = activity ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save activity');
      }

      const savedActivity = await res.json();

      // Fetch related data
      const contact = formData.contactId
        ? contacts.find((c) => c.id === formData.contactId) || null
        : null;
      const company = formData.companyId
        ? companies.find((c) => c.id === formData.companyId) || null
        : null;
      const deal = formData.dealId
        ? deals.find((d) => d.id === formData.dealId) || null
        : null;

      onSave({
        ...savedActivity,
        contact,
        company,
        deal,
      });
    } catch (error) {
      console.error('Failed to save activity:', error);
      alert(error instanceof Error ? error.message : '저장에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activity ? '활동 수정' : '새 활동'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <Label htmlFor="type">유형 *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value as typeof prev.type }))
              }
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">통화</SelectItem>
                <SelectItem value="email">이메일</SelectItem>
                <SelectItem value="meeting">미팅</SelectItem>
                <SelectItem value="note">노트</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">설명</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <Label htmlFor="scheduledAt">예정 일시</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  scheduledAt: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contactId">연락처</Label>
              <Select
                value={formData.contactId || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, contactId: value === '__none__' ? '' : value }))
                }
              >
                <SelectTrigger id="contactId">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">선택 안함</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="companyId">회사</Label>
              <Select
                value={formData.companyId || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, companyId: value === '__none__' ? '' : value }))
                }
              >
                <SelectTrigger id="companyId">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">선택 안함</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dealId">거래</Label>
              <Select
                value={formData.dealId || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, dealId: value === '__none__' ? '' : value }))
                }
              >
                <SelectTrigger id="dealId">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">선택 안함</SelectItem>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {errors.contactId && (
            <p className="text-sm text-red-600">{errors.contactId}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
