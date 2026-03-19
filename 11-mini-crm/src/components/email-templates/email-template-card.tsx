'use client';

import { EmailTemplate } from '@/lib/db/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

type Props = {
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
  onDuplicate: (template: EmailTemplate) => void;
};

export function EmailTemplateCard({
  template,
  onEdit,
  onDelete,
  onDuplicate,
}: Props) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="bg-purple-100 text-purple-700 rounded-full p-2 flex-shrink-0">
            <Mail className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {template.name}
            </h3>
            <p className="text-sm text-gray-600 truncate">{template.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(template)}
            title="복사"
          >
            <Copy className="h-3 w-3" />
          </Button>

          <Button variant="ghost" size="sm" onClick={() => onEdit(template)}>
            <Edit className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(template.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600 line-clamp-3">{template.body}</p>

        <p className="text-xs text-gray-500 pt-2 border-t">
          생성: {format(new Date(template.createdAt), 'PPP', { locale: ko })}
        </p>
      </div>
    </Card>
  );
}
