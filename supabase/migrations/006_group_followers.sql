-- Supabase Migration: 006_group_followers.sql

CREATE TABLE group_followers (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  wants_email BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, group_id)
);

-- Enable RLS
ALTER TABLE group_followers ENABLE ROW LEVEL SECURITY;

-- Users can insert, update, delete, and view their own follow relationships
CREATE POLICY "Users can manage their own follows" 
ON group_followers 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- System services (e.g., Cron bots checking wants_email) can read if they use the Service Role Key

-- End of migration
