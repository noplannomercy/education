-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for fuzzy search
CREATE INDEX IF NOT EXISTS idx_contacts_name_trgm ON contacts USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_companies_name_trgm ON companies USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_deals_title_trgm ON deals USING GIN (title gin_trgm_ops);
