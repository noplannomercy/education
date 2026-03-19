import { db } from '@/lib/db';
import { activities, contacts, companies, deals } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { ActivityList } from '@/components/activities/activity-list';

export const dynamic = 'force-dynamic';

export default async function ActivitiesPage() {
  const allActivities = await db
    .select({
      id: activities.id,
      type: activities.type,
      title: activities.title,
      description: activities.description,
      scheduledAt: activities.scheduledAt,
      completedAt: activities.completedAt,
      contactId: activities.contactId,
      companyId: activities.companyId,
      dealId: activities.dealId,
      createdAt: activities.createdAt,
      updatedAt: activities.updatedAt,
      contact: {
        id: contacts.id,
        name: contacts.name,
      },
      company: {
        id: companies.id,
        name: companies.name,
      },
      deal: {
        id: deals.id,
        title: deals.title,
      },
    })
    .from(activities)
    .leftJoin(contacts, eq(activities.contactId, contacts.id))
    .leftJoin(companies, eq(activities.companyId, companies.id))
    .leftJoin(deals, eq(activities.dealId, deals.id))
    .orderBy(
      sql`${activities.scheduledAt} DESC NULLS LAST`,
      desc(activities.createdAt)
    )
    .limit(100);

  // Fetch contacts, companies, and deals for the form
  const allContacts = await db
    .select({ id: contacts.id, name: contacts.name })
    .from(contacts)
    .orderBy(contacts.name);

  const allCompanies = await db
    .select({ id: companies.id, name: companies.name })
    .from(companies)
    .orderBy(companies.name);

  const allDeals = await db
    .select({ id: deals.id, title: deals.title })
    .from(deals)
    .orderBy(desc(deals.createdAt));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">활동</h1>
      </div>

      <ActivityList
        initialActivities={allActivities}
        contacts={allContacts}
        companies={allCompanies}
        deals={allDeals}
      />
    </div>
  );
}
