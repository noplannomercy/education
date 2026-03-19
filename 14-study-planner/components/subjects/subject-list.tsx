'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { deleteSubject } from '@/actions/subjects';
import { toast } from 'sonner';
import type { Subject } from '@/db/schema';

interface SubjectListProps {
  subjects: Subject[];
  onEdit?: (subject: Subject) => void;
}

export function SubjectList({ subjects, onEdit }: SubjectListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject? All related data will be deleted.')) {
      return;
    }

    setDeletingId(id);
    try {
      const result = await deleteSubject(id);
      if (result.success) {
        toast.success('Subject deleted!');
      } else {
        toast.error(result.error || 'Failed to delete subject');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  if (subjects.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No subjects yet. Create your first subject!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subjects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="font-medium">{subject.name}</span>
                <Badge variant="secondary">{subject.color}</Badge>
              </div>
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(subject)}
                  >
                    Edit
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(subject.id)}
                  disabled={deletingId === subject.id}
                >
                  {deletingId === subject.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
