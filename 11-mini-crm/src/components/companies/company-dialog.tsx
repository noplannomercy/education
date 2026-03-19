'use client';

import { useState, useEffect } from 'react';
import { Company } from '@/lib/db/schema';
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  onSave: (company: Company) => void;
};

export function CompanyDialog({ open, onOpenChange, company, onSave }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    address: '',
    employeeCount: '',
    memo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        industry: company.industry || '',
        website: company.website || '',
        address: company.address || '',
        employeeCount: company.employeeCount?.toString() || '',
        memo: company.memo || '',
      });
    } else {
      setFormData({
        name: '',
        industry: '',
        website: '',
        address: '',
        employeeCount: '',
        memo: '',
      });
    }
    setErrors({});
  }, [company, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: '회사명은 필수입니다' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        industry: formData.industry || null,
        website: formData.website || null,
        address: formData.address || null,
        employeeCount: formData.employeeCount
          ? parseInt(formData.employeeCount)
          : null,
        memo: formData.memo || null,
      };

      const url = company ? `/api/companies/${company.id}` : '/api/companies';
      const method = company ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save company');
      }

      const savedCompany = await res.json();
      onSave(savedCompany);
    } catch (error) {
      console.error('Failed to save company:', error);
      alert(error instanceof Error ? error.message : '저장에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{company ? '회사 수정' : '새 회사'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <Label htmlFor="name">회사명 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={errors.name ? 'border-red-500' : ''}
              placeholder="예: ABC 주식회사"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">업종</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, industry: e.target.value }))
                }
                placeholder="예: IT, 제조, 금융"
              />
            </div>

            <div>
              <Label htmlFor="employeeCount">직원 수</Label>
              <Input
                id="employeeCount"
                type="number"
                value={formData.employeeCount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    employeeCount: e.target.value,
                  }))
                }
                placeholder="예: 50"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">웹사이트</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, website: e.target.value }))
              }
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="address">주소</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="예: 서울시 강남구 테헤란로 123"
            />
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
              placeholder="회사 관련 메모..."
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
