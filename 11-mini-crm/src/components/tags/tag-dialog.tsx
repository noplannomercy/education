'use client';

import { useState, useEffect } from 'react';
import { Tag } from '@/lib/db/schema';
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

type TagBasic = Pick<Tag, 'id' | 'name' | 'color'>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: TagBasic | null;
  onSave: (tag: TagBasic) => void;
};

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
];

export function TagDialog({ open, onOpenChange, tag, onSave }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name,
        color: tag.color,
      });
    } else {
      setFormData({
        name: '',
        color: '#3B82F6',
      });
    }
    setErrors({});
  }, [tag, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: '태그명은 필수입니다' });
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      setErrors({ color: '올바른 Hex 색상 형식이 아닙니다 (예: #FF5733)' });
      return;
    }

    setIsSubmitting(true);

    try {
      const url = tag ? `/api/tags/${tag.id}` : '/api/tags';
      const method = tag ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save tag');
      }

      const savedTag = await res.json();
      onSave(savedTag);
    } catch (error) {
      console.error('Failed to save tag:', error);
      alert(error instanceof Error ? error.message : '저장에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tag ? '태그 수정' : '새 태그'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <Label htmlFor="name">태그명 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={errors.name ? 'border-red-500' : ''}
              placeholder="예: VIP, 긴급, 서울"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="color">색상 *</Label>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, color }))
                    }
                    className={`h-10 rounded-md border-2 transition-all ${
                      formData.color === color
                        ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <Input
                id="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                className={errors.color ? 'border-red-500' : ''}
                placeholder="#3B82F6"
                maxLength={7}
              />
              {errors.color && (
                <p className="text-sm text-red-600 mt-1">{errors.color}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: formData.color }}
            />
            <span className="text-sm font-medium">{formData.name || '태그 미리보기'}</span>
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
