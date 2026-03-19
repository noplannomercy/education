import { db } from '@/lib/db';
import { contacts, companies, deals } from '@/lib/db/schema';
import { NextResponse } from 'next/server';
import { ilike, or } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        contacts: [],
        companies: [],
        deals: [],
      });
    }

    const searchPattern = `%${query}%`;

    // Search in parallel
    const [contactResults, companyResults, dealResults] = await Promise.all([
      // Search contacts
      db
        .select({
          id: contacts.id,
          name: contacts.name,
          email: contacts.email,
          phone: contacts.phone,
          position: contacts.position,
        })
        .from(contacts)
        .where(
          or(
            ilike(contacts.name, searchPattern),
            ilike(contacts.email, searchPattern),
            ilike(contacts.phone, searchPattern)
          )
        )
        .limit(limit),

      // Search companies
      db
        .select({
          id: companies.id,
          name: companies.name,
          industry: companies.industry,
          website: companies.website,
        })
        .from(companies)
        .where(
          or(
            ilike(companies.name, searchPattern),
            ilike(companies.industry, searchPattern),
            ilike(companies.website, searchPattern)
          )
        )
        .limit(limit),

      // Search deals
      db
        .select({
          id: deals.id,
          title: deals.title,
          amount: deals.amount,
          stage: deals.stage,
        })
        .from(deals)
        .where(ilike(deals.title, searchPattern))
        .limit(limit),
    ]);

    return NextResponse.json({
      contacts: contactResults,
      companies: companyResults,
      deals: dealResults,
    });
  } catch (error) {
    console.error('Failed to search:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
