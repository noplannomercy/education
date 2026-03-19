'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createStudySession } from '@/actions/sessions';
import { toast } from 'sonner';
import type { Subject } from '@/db/schema';

interface SessionFormProps {
  subjects: Subject[];
  onSuccess?: () => void;
}

export function SessionForm({ subjects, onSuccess }: SessionFormProps) {
  const [subjectId, setSubjectId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [comprehension, setComprehension] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createStudySession({
        subjectId: parseInt(subjectId),
        durationMinutes: parseInt(durationMinutes),
        comprehension: parseInt(comprehension),
        notes: notes || null,
      });

      if (result.success) {
        toast.success('Study session created! Review scheduled.');
        setSubjectId('');
        setDurationMinutes('');
        setComprehension('');
        setNotes('');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to create study session');
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
        <CardTitle>Log Study Session</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId} required>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="e.g., 60"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comprehension">Comprehension Level (1-5)</Label>
            <Select value={comprehension} onValueChange={setComprehension} required>
              <SelectTrigger id="comprehension">
                <SelectValue placeholder="Rate your understanding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Didn&apos;t understand</SelectItem>
                <SelectItem value="2">2 - Poor understanding</SelectItem>
                <SelectItem value="3">3 - Average understanding</SelectItem>
                <SelectItem value="4">4 - Good understanding</SelectItem>
                <SelectItem value="5">5 - Excellent understanding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn? Any questions?"
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Log Session'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
