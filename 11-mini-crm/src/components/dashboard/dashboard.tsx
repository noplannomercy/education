'use client';

import { Activity } from '@/lib/db/schema';
import { Card } from '@/components/ui/card';
import {
  Users,
  Building2,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Activity as ActivityIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

type Stats = {
  counts: {
    contacts: number;
    companies: number;
    totalDeals: number;
    activeDeals: number;
    pendingActivities: number;
    pendingTasks: number;
    todayActivities: number;
    closedWonThisMonth: number;
  };
  amounts: {
    totalDeals: number;
    activeDeals: number;
    closedWonThisMonth: number;
  };
  pipeline: Array<{
    stage: string;
    count: number;
    amount: number;
  }>;
};

type Props = {
  stats: Stats | null;
  recentActivities: Activity[];
  todayActivities: Activity[];
};

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

const activityTypeLabels: Record<string, string> = {
  call: '통화',
  email: '이메일',
  meeting: '미팅',
  note: '노트',
};

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `₩${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `₩${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₩${(amount / 1_000).toFixed(0)}K`;
  }
  return `₩${amount.toLocaleString()}`;
}

export function Dashboard({ stats, recentActivities, todayActivities }: Props) {
  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center text-gray-500">통계를 불러올 수 없습니다</div>
      </div>
    );
  }

  const statCards = [
    {
      title: '연락처',
      value: stats.counts.contacts,
      icon: Users,
      color: 'bg-blue-100 text-blue-700',
      link: '/contacts',
    },
    {
      title: '회사',
      value: stats.counts.companies,
      icon: Building2,
      color: 'bg-green-100 text-green-700',
      link: '/companies',
    },
    {
      title: '진행 중 거래',
      value: stats.counts.activeDeals,
      subtitle: formatCurrency(stats.amounts.activeDeals),
      icon: Briefcase,
      color: 'bg-purple-100 text-purple-700',
      link: '/deals',
    },
    {
      title: '이번 달 성사',
      value: stats.counts.closedWonThisMonth,
      subtitle: formatCurrency(stats.amounts.closedWonThisMonth),
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">대시보드</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const content = (
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.subtitle && (
                      <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                    )}
                  </div>
                  <div className={`rounded-full p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            );

            return stat.link ? (
              <Link key={stat.title} href={stat.link}>
                {content}
              </Link>
            ) : (
              <div key={stat.title}>{content}</div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pipeline Summary */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                파이프라인 요약
              </h2>
            </div>

            <div className="space-y-3">
              {stats.pipeline
                .filter((stage) => !stage.stage.startsWith('closed'))
                .map((stage) => (
                  <div
                    key={stage.stage}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {stageLabels[stage.stage]}
                      </p>
                      <p className="text-sm text-gray-600">{stage.count}건</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(stage.amount)}
                    </p>
                  </div>
                ))}
            </div>

            <Link
              href="/deals"
              className="block mt-4 text-sm text-blue-600 hover:text-blue-700 text-center"
            >
              전체 파이프라인 보기 →
            </Link>
          </Card>

          {/* Today's Activities */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                오늘 예정 활동
              </h2>
              <span className="text-sm text-gray-500">
                ({todayActivities.length}개)
              </span>
            </div>

            {todayActivities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                오늘 예정된 활동이 없습니다
              </p>
            ) : (
              <div className="space-y-2">
                {todayActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{activityTypeLabels[activity.type]}</span>
                        {activity.scheduledAt && (
                          <span>
                            {format(new Date(activity.scheduledAt), 'HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/activities"
              className="block mt-4 text-sm text-blue-600 hover:text-blue-700 text-center"
            >
              전체 활동 보기 →
            </Link>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ActivityIcon className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">최근 활동</h2>
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              최근 활동이 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">
                        {activityTypeLabels[activity.type]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(
                          new Date(activity.createdAt),
                          'PPP p',
                          { locale: ko }
                        )}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    {activity.description && (
                      <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                        {activity.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/activities"
            className="block mt-4 text-sm text-blue-600 hover:text-blue-700 text-center"
          >
            전체 활동 보기 →
          </Link>
        </Card>
      </div>
    </div>
  );
}
