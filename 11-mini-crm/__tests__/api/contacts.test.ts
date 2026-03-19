import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { contacts, companies, activities, tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Contact API', () => {
  beforeEach(async () => {
    await db.delete(contacts);
    await db.delete(companies);
  });

  afterEach(async () => {
    await db.delete(contacts);
    await db.delete(companies);
  });

  describe('GET /api/contacts', () => {
    it('should return contacts with company info', async () => {
      const [company] = await db.insert(companies).values({
        name: 'Test Company',
      }).returning();

      await db.insert(contacts).values([
        { name: 'John Doe', companyId: company.id },
        { name: 'Jane Smith', companyId: null },
      ]);

      const response = await fetch('http://localhost:3000/api/contacts');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
    });

    it('should filter by companyId', async () => {
      const [company1] = await db.insert(companies).values({
        name: 'Company 1',
      }).returning();

      const [company2] = await db.insert(companies).values({
        name: 'Company 2',
      }).returning();

      await db.insert(contacts).values([
        { name: 'John', companyId: company1.id },
        { name: 'Jane', companyId: company2.id },
        { name: 'Bob', companyId: company1.id },
      ]);

      const response = await fetch(`http://localhost:3000/api/contacts?companyId=${company1.id}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].companyId).toBe(company1.id);
    });
  });

  describe('POST /api/contacts', () => {
    it('should create contact with company link', async () => {
      const [company] = await db.insert(companies).values({
        name: 'Test Company',
      }).returning();

      const response = await fetch('http://localhost:3000/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          position: 'Manager',
          companyId: company.id,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('John Doe');
      expect(data.companyId).toBe(company.id);
    });

    it('should create contact without company', async () => {
      const response = await fetch('http://localhost:3000/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Smith',
          email: 'jane@example.com',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Jane Smith');
      expect(data.companyId).toBeNull();
    });

    it('should return 400 if name is missing', async () => {
      const response = await fetch('http://localhost:3000/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('should return contact with company info', async () => {
      const [company] = await db.insert(companies).values({
        name: 'Test Company',
      }).returning();

      const [contact] = await db.insert(contacts).values({
        name: 'John Doe',
        companyId: company.id,
      }).returning();

      const response = await fetch(`http://localhost:3000/api/contacts/${contact.id}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(contact.id);
      expect(data.name).toBe('John Doe');
    });

    it('should return 404 if not found', async () => {
      const response = await fetch(`http://localhost:3000/api/contacts/00000000-0000-0000-0000-000000000000`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/contacts/:id', () => {
    it('should update contact', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Old Name',
        email: 'old@example.com',
      }).returning();

      const response = await fetch(`http://localhost:3000/api/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Name',
          email: 'new@example.com',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('New Name');
      expect(data.email).toBe('new@example.com');
    });

    it('should update company link', async () => {
      const [company1] = await db.insert(companies).values({
        name: 'Company 1',
      }).returning();

      const [company2] = await db.insert(companies).values({
        name: 'Company 2',
      }).returning();

      const [contact] = await db.insert(contacts).values({
        name: 'John',
        companyId: company1.id,
      }).returning();

      const response = await fetch(`http://localhost:3000/api/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John',
          companyId: company2.id,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.companyId).toBe(company2.id);
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should delete contact', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'To Delete',
      }).returning();

      const response = await fetch(`http://localhost:3000/api/contacts/${contact.id}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);

      const check = await db.select().from(contacts).where(eq(contacts.id, contact.id));
      expect(check).toHaveLength(0);
    });

    it('should cascade delete activities and tasks', async () => {
      const [contact] = await db.insert(contacts).values({
        name: 'Contact',
      }).returning();

      await db.insert(activities).values({
        type: 'note',
        title: 'Activity',
        contactId: contact.id,
      });

      await db.insert(tasks).values({
        title: 'Task',
        contactId: contact.id,
      });

      await fetch(`http://localhost:3000/api/contacts/${contact.id}`, {
        method: 'DELETE',
      });

      const relatedActivities = await db.select().from(activities).where(eq(activities.contactId, contact.id));
      const relatedTasks = await db.select().from(tasks).where(eq(tasks.contactId, contact.id));

      expect(relatedActivities).toHaveLength(0);
      expect(relatedTasks).toHaveLength(0);
    });
  });
});
