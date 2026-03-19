import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { tasks, contacts, companies, deals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Task API', () => {
  beforeEach(async () => {
    await db.delete(tasks);
    await db.delete(deals);
    await db.delete(contacts);
    await db.delete(companies);
  });

  afterEach(async () => {
    await db.delete(tasks);
    await db.delete(deals);
    await db.delete(contacts);
    await db.delete(companies);
  });

  describe('GET /api/tasks', () => {
    it('should return tasks with linked entities', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'John Doe',
      }).returning();

      await db.insert(tasks).values([
        { title: 'Task 1', priority: 'high', contactId: contact.id },
        { title: 'Task 2', priority: 'medium', contactId: contact.id },
      ]);

      const response = await fetch('http://localhost:3000/api/tasks');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].title).toBeDefined();
    });

    it('should filter by contactId', async () => {
      const [contact1] = await db.insert(contacts).values({
        name: 'Contact 1',
      }).returning();

      const [contact2] = await db.insert(contacts).values({
        name: 'Contact 2',
      }).returning();

      await db.insert(tasks).values([
        { title: 'Task 1', priority: 'high', contactId: contact1.id },
        { title: 'Task 2', priority: 'medium', contactId: contact2.id },
        { title: 'Task 3', priority: 'low', contactId: contact1.id },
      ]);

      const response = await fetch(`http://localhost:3000/api/tasks?contactId=${contact1.id}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
    });

    it('should filter by priority', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      await db.insert(tasks).values([
        { title: 'Task 1', priority: 'high', contactId: contact.id },
        { title: 'Task 2', priority: 'medium', contactId: contact.id },
        { title: 'Task 3', priority: 'high', contactId: contact.id },
      ]);

      const response = await fetch('http://localhost:3000/api/tasks?priority=high');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
    });

    it('should filter by due date range', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      await db.insert(tasks).values([
        { title: 'Today', priority: 'high', contactId: contact.id, dueDate: today },
        { title: 'Tomorrow', priority: 'medium', contactId: contact.id, dueDate: tomorrow },
        { title: 'Next Week', priority: 'low', contactId: contact.id, dueDate: nextWeek },
      ]);

      const fromDate = today.toISOString().split('T')[0];
      const toDate = tomorrow.toISOString().split('T')[0];

      const response = await fetch(`http://localhost:3000/api/tasks?fromDate=${fromDate}&toDate=${toDate}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by completion status', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      await db.insert(tasks).values([
        { title: 'Completed Task', priority: 'high', contactId: contact.id, isCompleted: true },
        { title: 'Incomplete Task 1', priority: 'medium', contactId: contact.id, isCompleted: false },
        { title: 'Incomplete Task 2', priority: 'low', contactId: contact.id, isCompleted: false },
      ]);

      const response = await fetch('http://localhost:3000/api/tasks?completed=false');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
    });

    it('should support pagination', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const tasks_data = Array.from({ length: 25 }, (_, i) => ({
        title: `Task ${i + 1}`,
        priority: 'medium' as const,
        contactId: contact.id,
      }));

      await db.insert(tasks).values(tasks_data);

      const response = await fetch('http://localhost:3000/api/tasks?page=2&limit=10');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(10);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.total).toBe(25);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create task with priority', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Follow-up call',
          description: 'Discuss proposal',
          priority: 'high',
          contactId: contact.id,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('Follow-up call');
      expect(data.priority).toBe('high');
      expect(data.contactId).toBe(contact.id);
    });

    it('should link to contact/company/deal', async () => {
      const [company] = await db.insert(companies).values({
        name: 'Company',
      }).returning();

      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
        companyId: company.id,
      }).returning();

      const [deal] = await db.insert(deals).values({
        title: 'Deal',
        amount: 10000,
        contactId: contact.id,
      }).returning();

      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Prepare proposal',
          priority: 'high',
          contactId: contact.id,
          companyId: company.id,
          dealId: deal.id,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.contactId).toBe(contact.id);
      expect(data.companyId).toBe(company.id);
      expect(data.dealId).toBe(deal.id);
    });

    it('should set dueDate for future tasks', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Scheduled task',
          priority: 'medium',
          contactId: contact.id,
          dueDate: tomorrow.toISOString(),
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.dueDate).toBeDefined();
    });

    it('should default to medium priority', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Task without priority',
          contactId: contact.id,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.priority).toBe('medium');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const [task] = await db.insert(tasks).values({
        title: 'Old title',
        priority: 'low',
        contactId: contact.id,
      }).returning();

      const response = await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New title',
          description: 'Updated description',
          priority: 'high',
          contactId: contact.id,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('New title');
      expect(data.description).toBe('Updated description');
      expect(data.priority).toBe('high');
    });

    it('should mark as completed with completedAt', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const [task] = await db.insert(tasks).values({
        title: 'Task',
        priority: 'medium',
        contactId: contact.id,
      }).returning();

      const completedAt = new Date();

      const response = await fetch(`http://localhost:3000/api/tasks/${task.id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedAt: completedAt.toISOString(),
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.completedAt).toBeDefined();
    });

    it('should update updatedAt on modification', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const [task] = await db.insert(tasks).values({
        title: 'Task',
        priority: 'medium',
        contactId: contact.id,
      }).returning();

      const response = await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Updated Task',
          priority: 'high',
          contactId: contact.id,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(new Date(data.updatedAt).getTime()).toBeGreaterThan(new Date(task.updatedAt).getTime());
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const [task] = await db.insert(tasks).values({
        title: 'To delete',
        priority: 'low',
        contactId: contact.id,
      }).returning();

      const response = await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);

      const check = await db.select().from(tasks).where(eq(tasks.id, task.id));
      expect(check).toHaveLength(0);
    });
  });
});
