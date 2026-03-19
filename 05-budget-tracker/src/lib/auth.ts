import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: { enabled: true },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const defaultCategories = [
            { name: '급여', type: 'income' as const, color: '#22c55e' },
            { name: '식비', type: 'expense' as const, color: '#ef4444' },
            { name: '교통', type: 'expense' as const, color: '#3b82f6' },
            { name: '주거', type: 'expense' as const, color: '#f59e0b' },
          ];
          await db.insert(schema.categories).values(
            defaultCategories.map(cat => ({
              id: crypto.randomUUID(),
              userId: user.id,
              name: cat.name,
              type: cat.type,
              color: cat.color,
              createdAt: new Date(),
              updatedAt: new Date(),
            }))
          );
        },
      },
    },
  },
});
