'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Subject } from '@/db/schema';

interface AIInsightsProps {
  subjects: Subject[];
}

export function AIInsights({ subjects }: AIInsightsProps) {
  const [subjectId, setSubjectId] = useState('');
  const [progressAnalysis, setProgressAnalysis] = useState<string | null>(null);
  const [methodRecommendation, setMethodRecommendation] = useState<string | null>(null);
  const [motivation, setMotivation] = useState<string | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isLoadingMethod, setIsLoadingMethod] = useState(false);
  const [isLoadingMotivation, setIsLoadingMotivation] = useState(false);

  const selectedSubject = subjects.find(s => s.id === parseInt(subjectId));

  const handleProgressAnalysis = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }

    setIsLoadingProgress(true);
    try {
      const response = await fetch('/api/ai/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject.id,
          subjectName: selectedSubject.name,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProgressAnalysis(result.data.analysis);
        toast.success('Progress analysis generated!');
      } else {
        toast.error(result.error || 'Failed to generate analysis');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const handleMethodRecommendation = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }

    setIsLoadingMethod(true);
    try {
      const response = await fetch('/api/ai/method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject.id,
          subjectName: selectedSubject.name,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMethodRecommendation(result.data.recommendations);
        toast.success('Method recommendations generated!');
      } else {
        toast.error(result.error || 'Failed to generate recommendations');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoadingMethod(false);
    }
  };

  const handleMotivation = async () => {
    setIsLoadingMotivation(true);
    try {
      const response = await fetch('/api/ai/motivation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (result.success) {
        setMotivation(result.data.aiMessage);
        toast.success('Motivation message generated!');
      } else {
        toast.error(result.error || 'Failed to generate motivation');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoadingMotivation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subject Selector */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="analysis-subject">Select Subject (for Analysis & Methods)</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger id="analysis-subject">
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

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleProgressAnalysis}
              disabled={!selectedSubject || isLoadingProgress}
            >
              {isLoadingProgress ? 'Analyzing...' : 'Get Progress Analysis'}
            </Button>
            <Button
              onClick={handleMethodRecommendation}
              disabled={!selectedSubject || isLoadingMethod}
              variant="outline"
            >
              {isLoadingMethod ? 'Analyzing...' : 'Get Study Method Recommendations'}
            </Button>
            <Button
              onClick={handleMotivation}
              disabled={isLoadingMotivation}
              variant="secondary"
            >
              {isLoadingMotivation ? 'Generating...' : 'Get Motivation'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Analysis */}
      {progressAnalysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Progress Analysis</CardTitle>
              {selectedSubject && (
                <Badge style={{ backgroundColor: selectedSubject.color }}>
                  {selectedSubject.name}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {progressAnalysis}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Method Recommendation */}
      {methodRecommendation && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Study Method Recommendations</CardTitle>
              {selectedSubject && (
                <Badge style={{ backgroundColor: selectedSubject.color }}>
                  {selectedSubject.name}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {methodRecommendation}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivation */}
      {motivation && (
        <Card>
          <CardHeader>
            <CardTitle>Motivation Message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {motivation}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
