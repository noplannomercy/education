'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { Subject, LearningPlan } from '@/db/schema';

interface PlanGeneratorProps {
  subjects: Subject[];
  onPlanCreated?: () => void;
}

export function PlanGenerator({ subjects, onPlanCreated }: PlanGeneratorProps) {
  const [subjectId, setSubjectId] = useState('');
  const [studyGoal, setStudyGoal] = useState('');
  const [weeksAvailable, setWeeksAvailable] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const subject = subjects.find(s => s.id === parseInt(subjectId));
    if (!subject) {
      toast.error('Please select a subject');
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: subject.id,
          subjectName: subject.name,
          studyGoal,
          weeksAvailable: parseInt(weeksAvailable),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Learning plan generated!');
        setStudyGoal('');
        setWeeksAvailable('');
        onPlanCreated?.();
      } else {
        toast.error(result.error || 'Failed to generate plan');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Learning Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan-subject">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId} required>
              <SelectTrigger id="plan-subject">
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
            <Label htmlFor="study-goal">Study Goal</Label>
            <Textarea
              id="study-goal"
              value={studyGoal}
              onChange={(e) => setStudyGoal(e.target.value)}
              placeholder="e.g., Master calculus fundamentals and be able to solve derivative problems"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weeks">Weeks Available</Label>
            <Input
              id="weeks"
              type="number"
              min="1"
              max="52"
              value={weeksAvailable}
              onChange={(e) => setWeeksAvailable(e.target.value)}
              placeholder="e.g., 8"
              required
            />
          </div>

          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? 'Generating Plan...' : 'Generate Plan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface PlanListProps {
  plans: (LearningPlan & { subject: Subject })[];
}

export function PlanList({ plans }: PlanListProps) {
  // Filter out plans with null subject
  const validPlans = plans.filter((plan) => plan.subject);

  if (validPlans.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No learning plans yet. Generate your first plan!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {validPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: plan.subject.color }}
                />
                <CardTitle className="text-lg">{plan.subject.name}</CardTitle>
                <span className="text-sm text-muted-foreground">• {plan.weeksAvailable} weeks</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{plan.studyGoal}</p>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {plan.aiPlan}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
