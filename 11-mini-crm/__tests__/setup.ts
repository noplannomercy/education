import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Load environment variables for tests
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://budget:budget123@localhost:5432/mini_crm';
}

// Cleanup after each test
afterEach(() => {
  cleanup();
});
