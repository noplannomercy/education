import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { deals, companies, contacts, activities, tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Deal API', () => {
  beforeEach(async () => {
    await db.delete(deals);
    await db.delete(contacts);
    await db.delete(companies);
  });

  afterEach(async () => {
    await db.delete(deals);
    await db.delete(contacts);
    await db.delete(companies);
  });

  describe('GET /api/deals', () => {
    it('should return deals with contact and company', async () => {
      const [company] = await db.insert(companies).values({
        name: 'Test Company',
      }).returning();

      const [contact] = await db.insert(contacts).values({
        name: 'John Doe',
        companyId: company.id,
      }).returning();

      await db.insert(deals).values([
        { title: 'Deal 1', contactId: contact.id, companyId: company.id, amount: 10000 },
        { title: 'Deal 2', contactId: contact.id, amount: 20000 },
      ]);

      const response = await fetch('http://localhost:3000/api/deals');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].title).toBeDefined();
    });

    it('should filter by stage', async () => {
      await db.insert(deals).values([
        { title: 'Lead Deal', stage: 'lead', amount: 1000 },
        { title: 'Qualified Deal', stage: 'qualified', amount: 2000 },
        { title: 'Another Lead', stage: 'lead', amount: 3000 },
      ]);

      const response = await fetch('http://localhost:3000/api/deals?stage=lead');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].stage).toBe('lead');
    });

    it('should return stage summary with totals', async () => {
      await db.insert(deals).values([
        { title: 'Lead 1', stage: 'lead', amount: 1000 },
        { title: 'Lead 2', stage: 'lead', amount: 2000 },
        { title: 'Qualified 1', stage: 'qualified', amount: 5000 },
        { title: 'Won 1', stage: 'closed_won', amount: 10000 },
      ]);

      const response = await fetch('http://localhost:3000/api/deals/summary');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stages).toBeDefined();
      expect(data.stages.lead.count).toBe(2);
      expect(data.stages.lead.total).toBe(3000);
      expect(data.stages.qualified.count).toBe(1);
      expect(data.stages.qualified.total).toBe(5000);
      expect(data.stages.closed_won.count).toBe(1);
      expect(data.stages.closed_won.total).toBe(10000);
    });
  });

  describe('POST /api/deals', () => {
    it('should create deal with default stage "lead"', async () => {
      const response = await fetch('http://localhost:3000/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Deal',
          amount: 5000,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('New Deal');
      expect(data.stage).toBe('lead');
      expect(data.amount).toBe(5000);
    });

    it('should link to contact and company', async () => {
      const [company] = await db.insert(companies).values({
        name: 'Test Company',
      }).returning();

      const [contact] = await db.insert(contacts).values({
        name: 'John Doe',
        companyId: company.id,
      }).returning();

      const response = await fetch('http://localhost:3000/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Linked Deal',
          amount: 10000,
          contactId: contact.id,
          companyId: company.id,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.contactId).toBe(contact.id);
      expect(data.companyId).toBe(company.id);
    });

    it('should return 400 if title is missing', async () => {
      const response = await fetch('http://localhost:3000/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000 }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/deals/:id', () => {
    it('should update deal stage', async () => {
      const [deal] = await db.insert(deals).values({
        title: 'Test Deal',
        stage: 'lead',
        amount: 5000,
      }).returning();

      const response = await fetch(`http://localhost:3000/api/deals/${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Deal',
          stage: 'qualified',
          amount: 5000,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stage).toBe('qualified');
    });

    it('should update amount', async () => {
      const [deal] = await db.insert(deals).values({
        title: 'Test Deal',
        amount: 5000,
      }).returning();

      const response = await fetch(`http://localhost:3000/api/deals/${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Deal',
          amount: 10000,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.amount).toBe(10000);
    });

    it('should create activity on stage change', async () => {
      const [deal] = await db.insert(deals).values({
        title: 'Test Deal',
        stage: 'lead',
        amount: 5000,
      }).returning();

      await fetch(`http://localhost:3000/api/deals/${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Deal',
          stage: 'qualified',
          amount: 5000,
        }),
      });

      // Check if activity was created
      const relatedActivities = await db.select().from(activities).where(eq(activities.dealId, deal.id));

      expect(relatedActivities).toHaveLength(1);
      expect(relatedActivities[0].type).toBe('note');
      expect(relatedActivities[0].title).toContain('lead');
      expect(relatedActivities[0].title).toContain('qualified');
    });
  });

  describe('DELETE /api/deals/:id', () => {
    it('should delete deal', async () => {
      const [deal] = await db.insert(deals).values({
        title: 'To Delete',
        amount: 1000,
      }).returning();

      const response = await fetch(`http://localhost:3000/api/deals/${deal.id}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);

      const check = await db.select().from(deals).where(eq(deals.id, deal.id));
      expect(check).toHaveLength(0);
    });

    it('should cascade delete activities and tasks', async () => {
      const [deal] = await db.insert(deals).values({
        title: 'Deal',
        amount: 1000,
      }).returning();

      await db.insert(activities).values({
        type: 'note',
        title: 'Activity',
        dealId: deal.id,
      });

      await db.insert(tasks).values({
        title: 'Task',
        dealId: deal.id,
      });

      await fetch(`http://localhost:3000/api/deals/${deal.id}`, {
        method: 'DELETE',
      });

      const relatedActivities = await db.select().from(activities).where(eq(activities.dealId, deal.id));
      const relatedTasks = await db.select().from(tasks).where(eq(tasks.dealId, deal.id));

      expect(relatedActivities).toHaveLength(0);
      expect(relatedTasks).toHaveLength(0);
    });
  });

  describe('PATCH /api/deals/:id/stage', () => {
    it('should update stage with optimistic locking', async () => {
      const [deal] = await db.insert(deals).values({
        title: 'Test Deal',
        stage: 'lead',
        amount: 5000,
      }).returning();

      const response = await fetch(`http://localhost:3000/api/deals/${deal.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'qualified',
          updatedAt: deal.updatedAt.toISOString(),
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      console.log('Response data:', data);

      expect(data.stage).toBe('qualified');
      expect(new Date(data.updatedAt).getTime()).toBeGreaterThan(new Date(deal.updatedAt).getTime());
    });

    it('should return 409 on concurrent modification', async () => {
      const [deal] = await db.insert(deals).values({
        title: 'Test Deal',
        stage: 'lead',
        amount: 5000,
      }).returning();

      // Wait 1 second to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Simulate concurrent update
      await db.update(deals)
        .set({ stage: 'proposal', updatedAt: new Date() })
        .where(eq(deals.id, deal.id));

      const response = await fetch(`http://localhost:3000/api/deals/${deal.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'qualified',
          updatedAt: deal.updatedAt.toISOString(),
        }),
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toContain('modified');
    });
  });
});
