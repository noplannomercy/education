'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StudySession, Subject } from '@/db/schema';

// Dynamic import of Recharts components with SSR disabled
const BarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import('recharts').then(mod => mod.Bar),
  { ssr: false }
);
const LineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import('recharts').then(mod => mod.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then(mod => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then(mod => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then(mod => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then(mod => mod.Tooltip),
  { ssr: false }
);
const Legend = dynamic(
  () => import('recharts').then(mod => mod.Legend),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
);

interface StudyChartsProps {
  sessions: (StudySession & { subject: Subject })[];
  subjects: Subject[];
}

export function StudyCharts({ sessions, subjects }: StudyChartsProps) {
  // Calculate total time by subject
  const timeBySubject = subjects.map(subject => {
    const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
    const totalMinutes = subjectSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    return {
      name: subject.name,
      hours: Math.round(totalMinutes / 60 * 10) / 10,
      color: subject.color,
    };
  }).filter(d => d.hours > 0);

  // Calculate average comprehension by subject
  const comprehensionBySubject = subjects.map(subject => {
    const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
    if (subjectSessions.length === 0) return null;
    const avgComprehension = subjectSessions.reduce((sum, s) => sum + s.comprehension, 0) / subjectSessions.length;
    return {
      name: subject.name,
      comprehension: Math.round(avgComprehension * 10) / 10,
      color: subject.color,
    };
  }).filter(d => d !== null);

  // Calculate daily study time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyTime = last7Days.map(date => {
    const daySessions = sessions.filter(s => {
      const sessionDate = s.studiedAt.toISOString().split('T')[0];
      return sessionDate === date;
    });
    const totalMinutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      minutes: totalMinutes,
    };
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Study Time by Subject (Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeBySubject}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Study Time (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Comprehension by Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comprehensionBySubject}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="comprehension" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
