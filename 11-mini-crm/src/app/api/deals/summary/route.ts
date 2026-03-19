import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deals } from '@/lib/db/schema';
import { dealStages } from '@/lib/validations';

// GET /api/deals/summary - Get stage summary with counts and totals
export async function GET() {
  try {
    // Get all deals
    const allDeals = await db.select().from(deals);

    // Group by stage
    const stages: Record<string, { count: number; total: number }> = {};

    // Initialize all stages
    dealStages.forEach(stage => {
      stages[stage] = { count: 0, total: 0 };
    });

    // Count and sum amounts
    allDeals.forEach(deal => {
      if (stages[deal.stage]) {
        stages[deal.stage].count += 1;
        stages[deal.stage].total += deal.amount;
      }
    });

    return NextResponse.json({ stages });
  } catch (error) {
    console.error('Failed to get deal summary:', error);
    return NextResponse.json(
      { error: 'Failed to get deal summary' },
      { status: 500 }
    );
  }
}
