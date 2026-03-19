'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ReviewSchedule, StudySession, Subject } from '@/db/schema';

interface ReviewCalendarProps {
  reviews: (ReviewSchedule & {
    session: StudySession & {
      subject: Subject;
    };
  })[];
}

export function ReviewCalendar({ reviews }: ReviewCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Filter out reviews with null session or subject
  const validReviews = reviews.filter((review) => review.session && review.session.subject);

  // Group reviews by date
  const reviewsByDate = validReviews.reduce((acc, review) => {
    const date = review.nextReviewDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(review);
    return acc;
  }, {} as Record<string, typeof validReviews>);

  // Get reviews for selected date
  const selectedDateStr = selectedDate?.toISOString().split('T')[0];
  const selectedReviews = selectedDateStr ? (reviewsByDate[selectedDateStr] || []) : [];

  // Get dates with reviews for highlighting
  const reviewDates = validReviews.map(r => new Date(r.nextReviewDate));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Review Schedule</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              hasReview: reviewDates,
            }}
            modifiersClassNames={{
              hasReview: 'bg-blue-100 font-bold',
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate
              ? `Reviews on ${selectedDate.toLocaleDateString()}`
              : 'Select a date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedReviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews scheduled for this date.</p>
          ) : (
            <div className="space-y-3">
              {selectedReviews.map((review) => (
                  <div key={review.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: review.session.subject.color }}
                      />
                      <span className="font-medium">{review.session.subject.name}</span>
                      <Badge variant="secondary">
                        Rep #{review.repetitionCount + 1}
                      </Badge>
                    </div>
                    {review.session.notes && (
                      <p className="text-sm text-muted-foreground">
                        {review.session.notes}
                      </p>
                    )}
                    {review.completedAt && (
                      <Badge variant="outline" className="mt-2">
                        Completed
                      </Badge>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
