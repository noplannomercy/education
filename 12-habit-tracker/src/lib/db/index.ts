import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create postgres client with connection pooling
const client = postgres(process.env.DATABASE_URL, {
  max: 10, // Maximum number of connections
})

// Create drizzle instance
export const db = drizzle(client, { schema })
