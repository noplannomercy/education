import { db } from '@/lib/db';
import { contacts, companies, deals, activities, tasks } from '@/lib/db/schema';
import { eq, gte, sql, and, lt, isNull } from 'drizzle-orm';

export async function getStats() {
  // Get counts
  const [contactCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contacts);

  const [companyCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(companies);

  // Get deals by stage with amount
  const dealsByStage = await db
    .select({
      stage: deals.stage,
      count: sql<number>`count(*)`,
      totalAmount: sql<number>`coalesce(sum(${deals.amount}), 0)`,
    })
    .from(deals)
    .groupBy(deals.stage);

  // Get total deals count and amount
  const [dealsTotal] = await db
    .select({
      count: sql<number>`count(*)`,
      totalAmount: sql<number>`coalesce(sum(${deals.amount}), 0)`,
    })
    .from(deals);

  // Get active deals (not closed_won or closed_lost)
  const [activeDeals] = await db
    .select({
      count: sql<number>`count(*)`,
      totalAmount: sql<number>`coalesce(sum(${deals.amount}), 0)`,
    })
    .from(deals)
    .where(
      sql`${deals.stage} IN ('lead', 'qualified', 'proposal', 'negotiation')`
    );

  // Get pending activities count
  const [pendingActivities] = await db
    .select({ count: sql<number>`count(*)` })
    .from(activities)
    .where(isNull(activities.completedAt));

  // Get pending tasks count
  const [pendingTasks] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(eq(tasks.isCompleted, false));

  // Get today's scheduled activities
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayActivities] = await db
    .select({ count: sql<number>`count(*)` })
    .from(activities)
    .where(
      and(
        gte(activities.scheduledAt, today),
        lt(activities.scheduledAt, tomorrow)
      )
    );

  // Get closed won deals this month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [closedWonThisMonth] = await db
    .select({
      count: sql<number>`count(*)`,
      totalAmount: sql<number>`coalesce(sum(${deals.amount}), 0)`,
    })
    .from(deals)
    .where(
      and(
        eq(deals.stage, 'closed_won'),
        gte(deals.updatedAt, firstDayOfMonth)
      )
    );

  return {
    counts: {
      contacts: Number(contactCount?.count || 0),
      companies: Number(companyCount?.count || 0),
      totalDeals: Number(dealsTotal?.count || 0),
      activeDeals: Number(activeDeals?.count || 0),
      pendingActivities: Number(pendingActivities?.count || 0),
      pendingTasks: Number(pendingTasks?.count || 0),
      todayActivities: Number(todayActivities?.count || 0),
      closedWonThisMonth: Number(closedWonThisMonth?.count || 0),
    },
    amounts: {
      totalDeals: Number(dealsTotal?.totalAmount || 0),
      activeDeals: Number(activeDeals?.totalAmount || 0),
      closedWonThisMonth: Number(closedWonThisMonth?.totalAmount || 0),
    },
    pipeline: dealsByStage.map((stage) => ({
      stage: stage.stage,
      count: Number(stage.count),
      amount: Number(stage.totalAmount),
    })),
  };
}
