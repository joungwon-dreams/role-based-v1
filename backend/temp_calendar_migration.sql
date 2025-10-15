-- Add missing columns to calendar_events table
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS label varchar(50) DEFAULT 'Business' NOT NULL;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS url varchar(500);
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS guests jsonb DEFAULT '[]'::jsonb;
