import { db } from '@/lib/db';
import { tasks, contacts, companies, deals } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { TaskList } from '@/components/tasks/task-list';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const allTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      dueDate: tasks.dueDate,
      priority: tasks.priority,
      isCompleted: tasks.isCompleted,
      contactId: tasks.contactId,
      companyId: tasks.companyId,
      dealId: tasks.dealId,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
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
    .from(tasks)
    .leftJoin(contacts, eq(tasks.contactId, contacts.id))
    .leftJoin(companies, eq(tasks.companyId, companies.id))
    .leftJoin(deals, eq(tasks.dealId, deals.id))
    .orderBy(
      sql`${tasks.dueDate} ASC NULLS LAST`,
      desc(tasks.createdAt)
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
        <h1 className="text-2xl font-semibold text-gray-900">태스크</h1>
      </div>

      <TaskList
        initialTasks={allTasks}
        contacts={allContacts}
        companies={allCompanies}
        deals={allDeals}
      />
    </div>
  );
}
