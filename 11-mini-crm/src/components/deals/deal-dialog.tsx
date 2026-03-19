'use client';

import { useState, useEffect } from 'react';
import { Deal } from '@/lib/db/schema';
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
import { PIPELINE_STAGES } from '@/lib/constants';

type DealWithRelations = Deal & {
  contact: { id: string; name: string } | null;
  company: { id: string; name: string } | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: DealWithRelations | null;
  onSave: (deal: Deal) => void;
  contacts: { id: string; name: string }[];
  companies: { id: string; name: string }[];
};

export function DealDialog({
  open,
  onOpenChange,
  deal,
  onSave,
  contacts,
  companies,
}: Props) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    stage: 'lead',
    expectedCloseDate: '',
    contactId: '',
    companyId: '',
    memo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (deal) {
      // Convert date to YYYY-MM-DD format for input
      const dateStr = deal.expectedCloseDate
        ? new Date(deal.expectedCloseDate).toISOString().split('T')[0]
        : '';

      setFormData({
        title: deal.title,
        amount: deal.amount.toString(),
        stage: deal.stage,
        expectedCloseDate: dateStr,
        contactId: deal.contactId || '',
        companyId: deal.companyId || '',
        memo: deal.memo || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '0',
        stage: 'lead',
        expectedCloseDate: '',
        contactId: '',
        companyId: '',
        memo: '',
      });
    }
    setErrors({});
  }, [deal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.title.trim()) {
      setErrors({ title: '거래명은 필수입니다' });
      return;
    }

    const amountNum = parseInt(formData.amount) || 0;
    if (amountNum < 0) {
      setErrors({ amount: '금액은 0 이상이어야 합니다' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        amount: amountNum,
        stage: formData.stage,
        expectedCloseDate: formData.expectedCloseDate || null,
        contactId: formData.contactId || null,
        companyId: formData.companyId || null,
        memo: formData.memo || null,
      };

      const url = deal ? `/api/deals/${deal.id}` : '/api/deals';
      const method = deal ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save deal');
      }

      const savedDeal = await res.json();
      onSave(savedDeal);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save deal:', error);
      alert(error instanceof Error ? error.message : '저장에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{deal ? '거래 수정' : '새 거래'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <Label htmlFor="title">거래명 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className={errors.title ? 'border-red-500' : ''}
              placeholder="예: ABC사 솔루션 도입"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">금액 (₩)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                className={errors.amount ? 'border-red-500' : ''}
                placeholder="0"
                min="0"
              />
              {errors.amount && (
                <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <Label htmlFor="stage">단계</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, stage: value }))
                }
              >
                <SelectTrigger id="stage">
                  <SelectValue placeholder="단계 선택" />
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGES.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="expectedCloseDate">예상 마감일</Label>
            <Input
              id="expectedCloseDate"
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expectedCloseDate: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactId">연락처</Label>
              <Select
                value={formData.contactId || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, contactId: value === '__none__' ? '' : value }))
                }
              >
                <SelectTrigger id="contactId">
                  <SelectValue placeholder="연락처 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">없음</SelectItem>
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
                  <SelectValue placeholder="회사 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">없음</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="memo">메모</Label>
            <textarea
              id="memo"
              value={formData.memo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, memo: e.target.value }))
              }
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
              placeholder="거래 관련 메모..."
            />
          </div>

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
