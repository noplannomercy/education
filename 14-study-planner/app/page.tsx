import { getSubjects } from '@/actions/subjects';
import { getStudySessions } from '@/actions/sessions';
import { getUpcomingReviews } from '@/actions/reviews';
import { SessionForm } from '@/components/sessions/session-form';
import { SubjectForm } from '@/components/subjects/subject-form';
import { SubjectList } from '@/components/subjects/subject-list';
import { TodayReviews } from '@/components/today/today-reviews';
import { ReviewCalendar } from '@/components/calendar/review-calendar';
import { StudyCharts } from '@/components/statistics/study-charts';
import { PlanGenerator, PlanList } from '@/components/plan/plan-generator';
import { AIInsights } from '@/components/analysis/ai-insights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/db';
import { learningPlans, reviewSchedules, studySessions } from '@/db/schema';
import { isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch all necessary data
  const [subjectsResult, sessionsResult, reviewsResult] = await Promise.all([
    getSubjects(),
    getStudySessions(),
    getUpcomingReviews(),
  ]);

  const subjects = subjectsResult.success && subjectsResult.data ? subjectsResult.data : [];
  const sessions = sessionsResult.success && sessionsResult.data ? sessionsResult.data : [];
  const todayReviewsRaw = reviewsResult.success && reviewsResult.data ? reviewsResult.data : [];
  const todayReviews = todayReviewsRaw.filter(r => r.session && r.session.subject);

  // Fetch sessions with subject data for charts
  const sessionsWithSubjectsRaw = await db.query.studySessions.findMany({
    with: {
      subject: true,
    },
    orderBy: (studySessions, { desc }) => [desc(studySessions.studiedAt)],
  });
  const sessionsWithSubjects = sessionsWithSubjectsRaw.filter(s => s.subject);

  // Fetch all reviews for calendar
  const allReviewsRaw = await db.query.reviewSchedules.findMany({
    where: isNull(reviewSchedules.completedAt),
    with: {
      session: {
        with: {
          subject: true,
        },
      },
    },
  });
  const allReviews = allReviewsRaw.filter(r => r.session && r.session.subject);

  // Fetch learning plans
  const plansRaw = await db.query.learningPlans.findMany({
    with: {
      subject: true,
    },
    orderBy: (learningPlans, { desc }) => [desc(learningPlans.createdAt)],
  });
  const plans = plansRaw.filter(p => p.subject);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">AI Study Planner</h1>
          <p className="text-muted-foreground mt-1">
            Track your learning progress and optimize with AI
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            {subjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Please create a subject first in the Plan tab.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <TodayReviews reviews={todayReviews} />
                </div>
                <div className="space-y-6">
                  <SessionForm subjects={subjects} />
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Recent Sessions</h2>
                    {sessions.length === 0 ? (
                      <p className="text-muted-foreground">No study sessions yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {sessions.slice(0, 5).map((session) => {
                          const subject = subjects.find((s) => s.id === session.subjectId);
                          return (
                            <div
                              key={session.id}
                              className="p-4 bg-white rounded-lg border"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {subject && (
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: subject.color }}
                                  />
                                )}
                                <span className="font-medium">{subject?.name || 'Unknown'}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Duration: {session.durationMinutes} min | Comprehension: {session.comprehension}/5
                              </div>
                              {session.notes && (
                                <p className="text-sm mt-2">{session.notes}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <ReviewCalendar reviews={allReviews} />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            {sessionsWithSubjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No study sessions yet. Log your first session in the Today tab!
                </p>
              </div>
            ) : (
              <StudyCharts sessions={sessionsWithSubjects} subjects={subjects} />
            )}
          </TabsContent>

          <TabsContent value="plan" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Subjects</h2>
              <div className="grid gap-6 lg:grid-cols-2 mb-8">
                <SubjectForm />
                <SubjectList subjects={subjects} />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">AI Learning Plans</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <PlanGenerator subjects={subjects} />
                <div>
                  <PlanList plans={plans} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <AIInsights subjects={subjects} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
