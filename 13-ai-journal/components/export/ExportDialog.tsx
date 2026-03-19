'use client';

import { useState } from 'react';
import { exportToMarkdown } from '@/actions/export';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    if (!startDate || !endDate) {
      toast.error('시작일과 종료일을 선택해주세요');
      return;
    }

    if (startDate > endDate) {
      toast.error('시작일이 종료일보다 늦을 수 없습니다');
      return;
    }

    setIsExporting(true);

    try {
      const markdown = await exportToMarkdown(startDate, endDate);

      // Create download link
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journal-export-${startDate}-to-${endDate}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('일기가 내보내기되었습니다');
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('내보내기에 실패했습니다');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Markdown 내보내기
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            선택한 기간의 일기를 Markdown 파일로 내보냅니다.
          </p>

          <div>
            <label className="text-sm font-medium">시작일</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">종료일</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? '내보내는 중...' : '내보내기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
