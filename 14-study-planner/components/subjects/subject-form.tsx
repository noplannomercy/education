'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createSubject, updateSubject } from '@/actions/subjects';
import { toast } from 'sonner';
import type { Subject } from '@/db/schema';

interface SubjectFormProps {
  subject?: Subject;
  onSuccess?: () => void;
}

export function SubjectForm({ subject, onSuccess }: SubjectFormProps) {
  const [name, setName] = useState(subject?.name || '');
  const [color, setColor] = useState(subject?.color || '#3b82f6');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = subject
        ? await updateSubject(subject.id, { name, color })
        : await createSubject({ name, color });

      if (result.success) {
        toast.success(subject ? 'Subject updated!' : 'Subject created!');
        if (!subject) {
          setName('');
          setColor('#3b82f6');
        }
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to save subject');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{subject ? 'Edit Subject' : 'New Subject'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mathematics"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : subject ? 'Update' : 'Create'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
