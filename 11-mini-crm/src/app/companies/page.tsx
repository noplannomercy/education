import { db } from '@/lib/db';
import { companies, contacts } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { CompanyList } from '@/components/companies/company-list';

export const dynamic = 'force-dynamic';

export default async function CompaniesPage() {
  // Fetch companies with contact count
  const allCompanies = await db
    .select({
      id: companies.id,
      name: companies.name,
      industry: companies.industry,
      website: companies.website,
      address: companies.address,
      employeeCount: companies.employeeCount,
      memo: companies.memo,
      createdAt: companies.createdAt,
      updatedAt: companies.updatedAt,
      contactCount: sql<number>`count(${contacts.id})`,
    })
    .from(companies)
    .leftJoin(contacts, eq(contacts.companyId, companies.id))
    .groupBy(companies.id)
    .orderBy(desc(companies.createdAt))
    .limit(100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">회사</h1>
        </div>
      </div>

      <CompanyList initialCompanies={allCompanies} />
    </div>
  );
}
