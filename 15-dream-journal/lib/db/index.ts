import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const connectionString = process.env.DATABASE_URL;

// Disable prepared statements for serverless environments
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
