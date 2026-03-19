'use client';

import { useState, useEffect } from 'react';
import { EmailTemplate } from '@/lib/db/schema';
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
import { Badge } from '@/components/ui/badge';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EmailTemplate | null;
  onSave: (template: EmailTemplate) => void;
};

const VARIABLES = [
  { name: '{{name}}', description: '연락처 이름' },
  { name: '{{company}}', description: '회사명' },
  { name: '{{email}}', description: '이메일' },
  { name: '{{phone}}', description: '전화번호' },
];

export function EmailTemplateDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: Props) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
      });
    } else {
      setFormData({
        name: '',
        subject: '',
        body: '',
      });
    }
    setErrors({});
  }, [template, open]);

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('body') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.body;
    const before = text.substring(0, start);
    const after = text.substring(end);

    setFormData((prev) => ({
      ...prev,
      body: before + variable + after,
    }));

    // Set cursor position after variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + variable.length,
        start + variable.length
      );
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: '템플릿명은 필수입니다' });
      return;
    }
    if (!formData.subject.trim()) {
      setErrors({ subject: '제목은 필수입니다' });
      return;
    }
    if (!formData.body.trim()) {
      setErrors({ body: '본문은 필수입니다' });
      return;
    }

    setIsSubmitting(true);

    try {
      const url = template?.id
        ? `/api/email-templates/${template.id}`
        : '/api/email-templates';
      const method = template?.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save template');
      }

      const savedTemplate = await res.json();
      onSave(savedTemplate);
    } catch (error) {
      console.error('Failed to save template:', error);
      alert(error instanceof Error ? error.message : '저장에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template?.id ? '템플릿 수정' : '새 템플릿'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <Label htmlFor="name">템플릿명 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={errors.name ? 'border-red-500' : ''}
              placeholder="예: 환영 인사, 제안서 발송"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="subject">제목 *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              className={errors.subject ? 'border-red-500' : ''}
              placeholder="이메일 제목"
            />
            {errors.subject && (
              <p className="text-sm text-red-600 mt-1">{errors.subject}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="body">본문 *</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">변수 삽입:</span>
                {VARIABLES.map((variable) => (
                  <Badge
                    key={variable.name}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => insertVariable(variable.name)}
                    title={variable.description}
                  >
                    {variable.name}
                  </Badge>
                ))}
              </div>
            </div>
            <textarea
              id="body"
              value={formData.body}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, body: e.target.value }))
              }
              className={`w-full min-h-[300px] px-3 py-2 border rounded-md font-mono text-sm ${
                errors.body ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="이메일 본문을 입력하세요..."
            />
            {errors.body && (
              <p className="text-sm text-red-600 mt-1">{errors.body}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              변수는 실제 데이터로 자동 치환됩니다
            </p>
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
