'use server';

import { db } from '@/db';
import { subjects, type NewSubject } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getSubjects() {
  try {
    const allSubjects = await db.select().from(subjects).orderBy(subjects.name);
    return { success: true, data: allSubjects };
  } catch (error) {
    console.error('Failed to fetch subjects:', error);
    return { success: false, error: 'Failed to fetch subjects' };
  }
}

export async function getSubjectById(id: number) {
  try {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    if (!subject) {
      return { success: false, error: 'Subject not found' };
    }
    return { success: true, data: subject };
  } catch (error) {
    console.error('Failed to fetch subject:', error);
    return { success: false, error: 'Failed to fetch subject' };
  }
}

export async function createSubject(data: NewSubject) {
  try {
    const [newSubject] = await db.insert(subjects).values(data).returning();
    revalidatePath('/');
    return { success: true, data: newSubject };
  } catch (error) {
    console.error('Failed to create subject:', error);
    return { success: false, error: 'Failed to create subject' };
  }
}

export async function updateSubject(id: number, data: Partial<NewSubject>) {
  try {
    const [updatedSubject] = await db
      .update(subjects)
      .set(data)
      .where(eq(subjects.id, id))
      .returning();

    if (!updatedSubject) {
      return { success: false, error: 'Subject not found' };
    }

    revalidatePath('/');
    return { success: true, data: updatedSubject };
  } catch (error) {
    console.error('Failed to update subject:', error);
    return { success: false, error: 'Failed to update subject' };
  }
}

export async function deleteSubject(id: number) {
  try {
    const [deletedSubject] = await db
      .delete(subjects)
      .where(eq(subjects.id, id))
      .returning();

    if (!deletedSubject) {
      return { success: false, error: 'Subject not found' };
    }

    revalidatePath('/');
    return { success: true, data: deletedSubject };
  } catch (error) {
    console.error('Failed to delete subject:', error);
    return { success: false, error: 'Failed to delete subject' };
  }
}
