import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { companies, contacts, activities, tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/companies/:id/delete-preview - Preview impact of deleting company
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Get company
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id));

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Count related entities
    const [relatedContacts, relatedActivities, relatedTasks] = await Promise.all([
      db.select().from(contacts).where(eq(contacts.companyId, id)),
      db.select().from(activities).where(eq(activities.companyId, id)),
      db.select().from(tasks).where(eq(tasks.companyId, id)),
    ]);

    return NextResponse.json({
      entityName: company.name,
      impact: {
        setNull: {
          contacts: relatedContacts.length,
          deals: 0, // Note: deals also have SET NULL on company_id
        },
        cascade: {
          activities: relatedActivities.length,
          tasks: relatedTasks.length,
        },
      },
    });
  } catch (error) {
    console.error('Failed to get delete preview:', error);
    return NextResponse.json(
      { error: 'Failed to get delete preview' },
      { status: 500 }
    );
  }
}
