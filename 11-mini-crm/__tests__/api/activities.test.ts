import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { activities, contacts, companies, deals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Activity API', () => {
  beforeEach(async () => {
    await db.delete(activities);
    await db.delete(deals);
    await db.delete(contacts);
    await db.delete(companies);
  });

  afterEach(async () => {
    await db.delete(activities);
    await db.delete(deals);
    await db.delete(contacts);
    await db.delete(companies);
  });

  describe('GET /api/activities', () => {
    it('should return activities with linked entities', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'John Doe',
      }).returning();

      await db.insert(activities).values([
        { type: 'call', title: 'Call 1', contactId: contact.id },
        { type: 'email', title: 'Email 1', contactId: contact.id },
      ]);

      const response = await fetch('http://localhost:3000/api/activities');
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

      await db.insert(activities).values([
        { type: 'call', title: 'Call 1', contactId: contact1.id },
        { type: 'call', title: 'Call 2', contactId: contact2.id },
        { type: 'email', title: 'Email 1', contactId: contact1.id },
      ]);

      const response = await fetch(`http://localhost:3000/api/activities?contactId=${contact1.id}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
    });

    it('should filter by type', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      await db.insert(activities).values([
        { type: 'call', title: 'Call 1', contactId: contact.id },
        { type: 'email', title: 'Email 1', contactId: contact.id },
        { type: 'call', title: 'Call 2', contactId: contact.id },
      ]);

      const response = await fetch('http://localhost:3000/api/activities?type=call');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
    });

    it('should filter by scheduled date range', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      await db.insert(activities).values([
        { type: 'call', title: 'Today', contactId: contact.id, scheduledAt: today },
        { type: 'call', title: 'Tomorrow', contactId: contact.id, scheduledAt: tomorrow },
        { type: 'call', title: 'Next Week', contactId: contact.id, scheduledAt: nextWeek },
      ]);

      const fromDate = today.toISOString().split('T')[0];
      const toDate = tomorrow.toISOString().split('T')[0];

      const response = await fetch(`http://localhost:3000/api/activities?fromDate=${fromDate}&toDate=${toDate}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should support pagination', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const activities_data = Array.from({ length: 25 }, (_, i) => ({
        type: 'note' as const,
        title: `Activity ${i + 1}`,
        contactId: contact.id,
      }));

      await db.insert(activities).values(activities_data);

      const response = await fetch('http://localhost:3000/api/activities?page=2&limit=10');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(10);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.total).toBe(25);
    });
  });

  describe('POST /api/activities', () => {
    it('should create activity with type', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const response = await fetch('http://localhost:3000/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'call',
          title: 'Follow-up call',
          description: 'Discuss proposal',
          contactId: contact.id,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.type).toBe('call');
      expect(data.title).toBe('Follow-up call');
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

      const response = await fetch('http://localhost:3000/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'meeting',
          title: 'Client meeting',
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

    it('should set scheduledAt for future activities', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await fetch('http://localhost:3000/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'call',
          title: 'Scheduled call',
          contactId: contact.id,
          scheduledAt: tomorrow.toISOString(),
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.scheduledAt).toBeDefined();
    });

    it('should return 400 if no parent FK provided', async () => {
      const response = await fetch('http://localhost:3000/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'note',
          title: 'Orphan activity',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should validate at least one parent is linked', async () => {
      const response = await fetch('http://localhost:3000/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'note',
          title: 'Test',
          contactId: null,
          companyId: null,
          dealId: null,
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/activities/:id', () => {
    it('should update activity', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const [activity] = await db.insert(activities).values({
        type: 'call',
        title: 'Old title',
        contactId: contact.id,
      }).returning();

      const response = await fetch(`http://localhost:3000/api/activities/${activity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'call',
          title: 'New title',
          description: 'Updated description',
          contactId: contact.id,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('New title');
      expect(data.description).toBe('Updated description');
    });

    it('should mark as completed with completedAt', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const [activity] = await db.insert(activities).values({
        type: 'call',
        title: 'Call',
        contactId: contact.id,
      }).returning();

      const completedAt = new Date();

      const response = await fetch(`http://localhost:3000/api/activities/${activity.id}/complete`, {
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

      const [activity] = await db.insert(activities).values({
        type: 'call',
        title: 'Call',
        contactId: contact.id,
      }).returning();

      const response = await fetch(`http://localhost:3000/api/activities/${activity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'call',
          title: 'Updated Call',
          contactId: contact.id,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(new Date(data.updatedAt).getTime()).toBeGreaterThan(new Date(activity.updatedAt).getTime());
    });
  });

  describe('DELETE /api/activities/:id', () => {
    it('should delete activity', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      const [activity] = await db.insert(activities).values({
        type: 'call',
        title: 'To delete',
        contactId: contact.id,
      }).returning();

      const response = await fetch(`http://localhost:3000/api/activities/${activity.id}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);

      const check = await db.select().from(activities).where(eq(activities.id, activity.id));
      expect(check).toHaveLength(0);
    });
  });
});
