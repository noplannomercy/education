import { db } from '@/lib/db';
import { contacts, companies } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { ContactList } from '@/components/contacts/contact-list';

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
  // Fetch contacts with company info
  const allContacts = await db
    .select({
      id: contacts.id,
      name: contacts.name,
      email: contacts.email,
      phone: contacts.phone,
      position: contacts.position,
      companyId: contacts.companyId,
      memo: contacts.memo,
      createdAt: contacts.createdAt,
      updatedAt: contacts.updatedAt,
      company: {
        id: companies.id,
        name: companies.name,
      },
    })
    .from(contacts)
    .leftJoin(companies, eq(contacts.companyId, companies.id))
    .orderBy(desc(contacts.createdAt))
    .limit(100);

  // Fetch all companies for the dialog
  const allCompanies = await db
    .select({ id: companies.id, name: companies.name })
    .from(companies)
    .orderBy(companies.name);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">연락처</h1>
        </div>
      </div>

      <ContactList initialContacts={allContacts} companies={allCompanies} />
    </div>
  );
}
