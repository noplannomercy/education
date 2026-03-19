'use client';

import { useState } from 'react';
import { EmailTemplate } from '@/lib/db/schema';
import { EmailTemplateCard } from './email-template-card';
import { EmailTemplateDialog } from './email-template-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type Props = {
  initialTemplates: EmailTemplate[];
};

export function EmailTemplateList({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  );

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 템플릿을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/email-templates/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert('삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('삭제 중 오류가 발생했습니다');
    }
  };

  const handleDuplicate = (template: EmailTemplate) => {
    setEditingTemplate({
      ...template,
      id: '',
      name: `${template.name} (복사본)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as EmailTemplate);
    setIsDialogOpen(true);
  };

  const handleSave = (template: EmailTemplate) => {
    if (editingTemplate && editingTemplate.id) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? template : t))
      );
    } else {
      setTemplates((prev) => [template, ...prev]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          총 {templates.length}개의 템플릿
        </p>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />새 템플릿
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          템플릿이 없습니다. 새 템플릿을 만들어보세요.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <EmailTemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      <EmailTemplateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        template={editingTemplate}
        onSave={handleSave}
      />
    </div>
  );
}
