'use server';

import { db } from '@/db';
import { tags, journalTags } from '@/db/schema';
import type { Tag } from '@/db/schema';
import type { ActionResult } from '@/lib/types';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createTag(
  name: string,
  color: string = '#3B82F6'
): Promise<ActionResult<Tag>> {
  try {
    // Check if tag already exists
    const existing = await db.query.tags.findFirst({
      where: eq(tags.name, name),
    });

    if (existing) {
      return {
        success: false,
        error: '이미 존재하는 태그입니다.',
      };
    }

    const [tag] = await db
      .insert(tags)
      .values({ name, color })
      .returning();

    revalidatePath('/');
    return { success: true, data: tag };
  } catch (error) {
    console.error('Create tag error:', error);
    return {
      success: false,
      error: '태그 생성에 실패했습니다.',
    };
  }
}

export async function deleteTag(id: string): Promise<ActionResult<void>> {
  try {
    await db.delete(tags).where(eq(tags.id, id));

    revalidatePath('/');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Delete tag error:', error);
    return {
      success: false,
      error: '태그 삭제에 실패했습니다.',
    };
  }
}

export async function getAllTags(): Promise<Tag[]> {
  try {
    const allTags = await db.query.tags.findMany({
      orderBy: (tags, { asc }) => [asc(tags.name)],
    });

    return allTags;
  } catch (error) {
    console.error('Get all tags error:', error);
    return [];
  }
}

export async function assignTagToJournal(
  journalId: string,
  tagId: string
): Promise<ActionResult<void>> {
  try {
    // Check if already assigned
    const existing = await db.query.journalTags.findFirst({
      where: and(
        eq(journalTags.journalId, journalId),
        eq(journalTags.tagId, tagId)
      ),
    });

    if (existing) {
      return {
        success: false,
        error: '이미 부여된 태그입니다.',
      };
    }

    await db.insert(journalTags).values({
      journalId,
      tagId,
    });

    revalidatePath('/');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Assign tag error:', error);
    return {
      success: false,
      error: '태그 부여에 실패했습니다.',
    };
  }
}

export async function removeTagFromJournal(
  journalId: string,
  tagId: string
): Promise<ActionResult<void>> {
  try {
    await db
      .delete(journalTags)
      .where(
        and(
          eq(journalTags.journalId, journalId),
          eq(journalTags.tagId, tagId)
        )
      );

    revalidatePath('/');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Remove tag error:', error);
    return {
      success: false,
      error: '태그 제거에 실패했습니다.',
    };
  }
}

export async function getTagsByJournal(journalId: string): Promise<Tag[]> {
  try {
    const result = await db.query.journalTags.findMany({
      where: eq(journalTags.journalId, journalId),
      with: {
        tag: true,
      },
    });

    return result.map(jt => jt.tag);
  } catch (error) {
    console.error('Get tags by journal error:', error);
    return [];
  }
}
