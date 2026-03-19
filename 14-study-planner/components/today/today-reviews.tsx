'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { completeReview } from '@/actions/reviews';
import { toast } from 'sonner';
import type { ReviewSchedule, StudySession, Subject } from '@/db/schema';

interface TodayReviewsProps {
  reviews: (ReviewSchedule & {
    session: StudySession & {
      subject: Subject;
    };
  })[];
}

export function TodayReviews({ reviews: initialReviews }: TodayReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [comprehensionLevels, setComprehensionLevels] = useState<Record<number, string>>({});

  // Filter out reviews with null session or subject
  const validReviews = reviews.filter((review) => review.session && review.session.subject);

  const handleComplete = async (reviewId: number) => {
    const comprehension = comprehensionLevels[reviewId];
    if (!comprehension) {
      toast.error('Please select comprehension level');
      return;
    }

    setCompletingId(reviewId);
    try {
      const result = await completeReview(reviewId, parseInt(comprehension));
      if (result.success && result.data) {
        toast.success(`Review completed! Next review: ${result.data.nextReviewDate.toLocaleDateString()}`);
        // Remove completed review from list
        setReviews(reviews.filter(r => r.id !== reviewId));
      } else {
        toast.error(result.error || 'Failed to complete review');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setCompletingId(null);
    }
  };

  if (validReviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No reviews due today. Great job staying on top of your studies!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Reviews ({validReviews.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {validReviews.map((review) => (
              <div
                key={review.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: review.session.subject.color }}
                  />
                  <span className="font-medium">{review.session.subject.name}</span>
                  <span className="text-sm text-muted-foreground">
                    • Repetition #{review.repetitionCount + 1}
                  </span>
                </div>

              {review.session.notes && (
                <p className="text-sm text-muted-foreground">
                  Notes: {review.session.notes}
                </p>
              )}

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor={`comprehension-${review.id}`}>
                    How well do you remember this?
                  </Label>
                  <Select
                    value={comprehensionLevels[review.id] || ''}
                    onValueChange={(value) =>
                      setComprehensionLevels({ ...comprehensionLevels, [review.id]: value })
                    }
                  >
                    <SelectTrigger id={`comprehension-${review.id}`}>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Don&apos;t remember</SelectItem>
                      <SelectItem value="2">2 - Vague memory</SelectItem>
                      <SelectItem value="3">3 - Some recall</SelectItem>
                      <SelectItem value="4">4 - Clear recall</SelectItem>
                      <SelectItem value="5">5 - Perfect recall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => handleComplete(review.id)}
                  disabled={completingId === review.id}
                >
                  {completingId === review.id ? 'Completing...' : 'Complete Review'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
