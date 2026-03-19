import { describe, it, expect, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { companies, contacts, activities, tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Company API', () => {
  // Clean up after each test
  afterEach(async () => {
    await db.delete(companies);
  });

  describe('GET /api/companies', () => {
    it('should return empty array when no companies', async () => {
      const response = await fetch('http://localhost:3000/api/companies');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
    });

    it('should return all companies', async () => {
      // Create test data
      await db.insert(companies).values([
        { name: 'Company A', industry: 'Tech' },
        { name: 'Company B', industry: 'Finance' },
      ]);

      const response = await fetch('http://localhost:3000/api/companies');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].name).toBe('Company A');
    });

    it('should support pagination (page, limit)', async () => {
      // Create 25 companies
      const testCompanies = Array.from({ length: 25 }, (_, i) => ({
        name: `Company ${i + 1}`,
      }));
      await db.insert(companies).values(testCompanies);

      const response = await fetch('http://localhost:3000/api/companies?page=2&limit=10');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(10);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.total).toBe(25);
      expect(data.pagination.totalPages).toBe(3);
      expect(data.pagination.hasNext).toBe(true);
      expect(data.pagination.hasPrev).toBe(true);
    });

    it('should support cursor-based pagination', async () => {
      const inserted = await db.insert(companies).values([
        { name: 'Company A' },
        { name: 'Company B' },
        { name: 'Company C' },
      ]).returning();

      const response = await fetch(`http://localhost:3000/api/companies?cursor=${inserted[0].id}&limit=2`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].id).not.toBe(inserted[0].id);
    });
  });

  describe('POST /api/companies', () => {
    it('should create company with valid data', async () => {
      const newCompany = {
        name: 'Test Company',
        industry: 'Technology',
        website: 'https://example.com',
        address: '123 Main St',
        employeeCount: 50,
        memo: 'Test memo',
      };

      const response = await fetch('http://localhost:3000/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompany),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Test Company');
      expect(data.industry).toBe('Technology');
      expect(data.id).toBeDefined();
      expect(data.createdAt).toBeDefined();
    });

    it('should return 400 if name is missing', async () => {
      const response = await fetch('http://localhost:3000/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: 'Tech' }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/companies/:id', () => {
    it('should return company by id', async () => {
      const [company] = await db.insert(companies).values({
        name: 'Test Company',
        industry: 'Tech',
      }).returning();

      const response = await fetch(`http://localhost:3000/api/companies/${company.id}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(company.id);
      expect(data.name).toBe('Test Company');
    });

    it('should return 404 if not found', async () => {
      const response = await fetch(`http://localhost:3000/api/companies/00000000-0000-0000-0000-000000000000`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/companies/:id', () => {
    it('should update company', async () => {
      const [company] = await db.insert(companies).values({
        name: 'Old Name',
        industry: 'Tech',
      }).returning();

      const response = await fetch(`http://localhost:3000/api/companies/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Name',
          industry: 'Finance',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('New Name');
      expect(data.industry).toBe('Finance');
    });

    it('should return 404 if not found', async () => {
      const response = await fetch(`http://localhost:3000/api/companies/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/companies/:id', () => {
    it('should delete company', async () => {
      const [company] = await db.insert(companies).values({
        name: 'To Delete',
      }).returning();

      const response = await fetch(`http://localhost:3000/api/companies/${company.id}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);

      // Verify deletion
      const check = await db.select().from(companies).where(eq(companies.id, company.id));
      expect(check).toHaveLength(0);
    });

    it('should set null on related contacts', async () => {
      const [company] = await db.insert(companies).values({
        name: 'Company with Contacts',
      }).returning();

      const [contact] = await db.insert(contacts).values({
        name: 'John Doe',
        companyId: company.id,
      }).returning();

      await fetch(`http://localhost:3000/api/companies/${company.id}`, {
        method: 'DELETE',
      });

      // Verify contact still exists but companyId is null
      const [updatedContact] = await db.select().from(contacts).where(eq(contacts.id, contact.id));
      expect(updatedContact.companyId).toBeNull();
    });
  });

  describe('GET /api/companies/:id/delete-preview', () => {
    it('should return impact count for contacts', async () => {
      const [company] = await db.insert(companies).values({
        name: 'Company',
      }).returning();

      await db.insert(contacts).values([
        { name: 'Contact 1', companyId: company.id },
        { name: 'Contact 2', companyId: company.id },
      ]);

      const response = await fetch(`http://localhost:3000/api/companies/${company.id}/delete-preview`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.entityName).toBe('Company');
      expect(data.impact.setNull.contacts).toBe(2);
    });

    it('should return impact count for activities (cascade)', async () => {
      const [company] = await db.insert(companies).values({
        name: 'Company',
      }).returning();

      await db.insert(activities).values([
        { type: 'note', title: 'Activity 1', companyId: company.id },
        { type: 'call', title: 'Activity 2', companyId: company.id },
      ]);

      const response = await fetch(`http://localhost:3000/api/companies/${company.id}/delete-preview`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.impact.cascade.activities).toBe(2);
    });

    it('should return impact count for tasks (cascade)', async () => {
      const [company] = await db.insert(companies).values({
        name: 'Company',
      }).returning();

      await db.insert(tasks).values([
        { title: 'Task 1', companyId: company.id },
        { title: 'Task 2', companyId: company.id },
        { title: 'Task 3', companyId: company.id },
      ]);

      const response = await fetch(`http://localhost:3000/api/companies/${company.id}/delete-preview`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.impact.cascade.tasks).toBe(3);
    });
  });
});
