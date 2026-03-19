'use server';

import { db } from '@/db';
import { journalEntries, journalTags } from '@/db/schema';
import type { NewJournalEntry, JournalEntry } from '@/db/schema';
import type { ActionResult, SearchFilters } from '@/lib/types';
import { eq, and, gte, lte, desc, or, ilike, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createJournal(
  data: NewJournalEntry
): Promise<ActionResult<JournalEntry>> {
  try {
    // Check for duplicate journal on same date
    const existing = await db.query.journalEntries.findFirst({
      where: eq(journalEntries.date, data.date),
    });

    if (existing) {
      return {
        success: false,
        error: '이 날짜에 이미 일기가 작성되어 있습니다. 기존 일기를 수정하거나 삭제해주세요.',
      };
    }

    const [journal] = await db
      .insert(journalEntries)
      .values(data)
      .returning();

    revalidatePath('/');
    return { success: true, data: journal };
  } catch (error) {
    console.error('Create journal error:', error);
    return {
      success: false,
      error: '일기 작성에 실패했습니다.',
    };
  }
}

export async function updateJournal(
  id: string,
  data: Partial<NewJournalEntry>
): Promise<ActionResult<JournalEntry>> {
  try {
    const [journal] = await db
      .update(journalEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();

    if (!journal) {
      return {
        success: false,
        error: '일기를 찾을 수 없습니다.',
      };
    }

    revalidatePath('/');
    return { success: true, data: journal };
  } catch (error) {
    console.error('Update journal error:', error);
    return {
      success: false,
      error: '일기 수정에 실패했습니다.',
    };
  }
}

export async function deleteJournal(id: string): Promise<ActionResult<void>> {
  try {
    await db.delete(journalEntries).where(eq(journalEntries.id, id));

    revalidatePath('/');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Delete journal error:', error);
    return {
      success: false,
      error: '일기 삭제에 실패했습니다.',
    };
  }
}

export async function getJournalByDate(date: string): Promise<JournalEntry | null> {
  try {
    const journal = await db.query.journalEntries.findFirst({
      where: eq(journalEntries.date, date),
      with: {
        emotionAnalysis: true,
        journalTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    return journal || null;
  } catch (error) {
    console.error('Get journal by date error:', error);
    return null;
  }
}

export async function getJournalById(id: string) {
  try {
    const journal = await db.query.journalEntries.findFirst({
      where: eq(journalEntries.id, id),
      with: {
        emotionAnalysis: true,
        journalTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    return journal || null;
  } catch (error) {
    console.error('Get journal by id error:', error);
    return null;
  }
}

export async function getJournalsByMonth(year: number, month: number) {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const journals = await db.query.journalEntries.findMany({
      where: and(
        gte(journalEntries.date, startDate),
        lte(journalEntries.date, endDate)
      ),
      with: {
        emotionAnalysis: true,
        journalTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(journalEntries.date)],
    });

    return journals;
  } catch (error) {
    console.error('Get journals by month error:', error);
    return [];
  }
}

export async function getJournalDatesInMonth(
  year: number,
  month: number
): Promise<string[]> {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const journals = await db
      .select({ date: journalEntries.date })
      .from(journalEntries)
      .where(and(
        gte(journalEntries.date, startDate),
        lte(journalEntries.date, endDate)
      ));

    return journals.map(j => j.date);
  } catch (error) {
    console.error('Get journal dates error:', error);
    return [];
  }
}

export async function searchJournals(filters: SearchFilters) {
  try {
    const conditions = [];

    // Text search (title or content)
    if (filters.query) {
      conditions.push(
        or(
          ilike(journalEntries.title, `%${filters.query}%`),
          ilike(journalEntries.content, `%${filters.query}%`)
        )
      );
    }

    // Date range filter
    if (filters.startDate) {
      conditions.push(gte(journalEntries.date, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(journalEntries.date, filters.endDate));
    }

    // Tag filter
    if (filters.tagIds && filters.tagIds.length > 0) {
      const journalsWithTags = await db
        .selectDistinct({ journalId: journalTags.journalId })
        .from(journalTags)
        .where(inArray(journalTags.tagId, filters.tagIds));

      const journalIds = journalsWithTags.map(j => j.journalId);

      if (journalIds.length > 0) {
        conditions.push(inArray(journalEntries.id, journalIds));
      } else {
        // No journals found with these tags
        return [];
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const journals = await db.query.journalEntries.findMany({
      where: whereClause,
      with: {
        emotionAnalysis: true,
        journalTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(journalEntries.date)],
      limit: 50,
    });

    return journals;
  } catch (error) {
    console.error('Search journals error:', error);
    return [];
  }
}
