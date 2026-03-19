import { db } from '@/lib/db';
import { contacts, companies } from '@/lib/db/schema';
import { PipelineBoard } from '@/components/deals/pipeline-board';

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
  // Fetch deals with relations using Drizzle query API
  const allDeals = await db.query.deals.findMany({
    with: {
      contact: {
        columns: {
          id: true,
          name: true,
        },
      },
      company: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: (deals, { desc }) => [desc(deals.createdAt)],
  });

  // Fetch all contacts for the dialog
  const allContacts = await db
    .select({ id: contacts.id, name: contacts.name })
    .from(contacts)
    .orderBy(contacts.name);

  // Fetch all companies for the dialog
  const allCompanies = await db
    .select({ id: companies.id, name: companies.name })
    .from(companies)
    .orderBy(companies.name);

  return (
    <div className="min-h-screen bg-white">
      <PipelineBoard
        initialDeals={allDeals}
        contacts={allContacts}
        companies={allCompanies}
      />
    </div>
  );
}
