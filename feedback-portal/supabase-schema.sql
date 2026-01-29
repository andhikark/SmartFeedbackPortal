-- Smart Feedback Portal - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  description TEXT NOT NULL CHECK (char_length(description) >= 10 AND char_length(description) <= 5000),
  category TEXT CHECK (category IN ('Bug', 'Feature', 'General', 'Urgent') OR category IS NULL),
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low') OR priority IS NULL),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processed', 'Reviewed', 'Resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Users can read own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;
DROP POLICY IF EXISTS "Service role can update feedback" ON feedback;

-- RLS Policy: Users can only read their own feedback
CREATE POLICY "Users can read own feedback"
  ON feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own feedback
CREATE POLICY "Users can insert own feedback"
  ON feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Allow service role to update feedback (for n8n)
-- This policy allows updates when using the service role key
CREATE POLICY "Service role can update feedback"
  ON feedback
  FOR UPDATE
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback(priority);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for the feedback table
-- This allows the frontend to receive real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE feedback;

-- Create a view for analytics (optional, but useful)
CREATE OR REPLACE VIEW feedback_stats AS
SELECT 
  user_id,
  COUNT(*) as total_feedback,
  COUNT(*) FILTER (WHERE status = 'Pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'Processed') as processed_count,
  COUNT(*) FILTER (WHERE priority = 'High') as high_priority_count,
  COUNT(*) FILTER (WHERE category = 'Bug') as bug_count
FROM feedback
GROUP BY user_id;

-- Grant access to the view
GRANT SELECT ON feedback_stats TO authenticated;

-- Add RLS to the view
ALTER VIEW feedback_stats SET (security_invoker = true);

-- Verification queries (optional - run these to verify setup)
-- SELECT * FROM feedback LIMIT 1;
-- SELECT * FROM pg_policies WHERE tablename = 'feedback';
-- SELECT * FROM pg_indexes WHERE tablename = 'feedback';

COMMENT ON TABLE feedback IS 'Stores customer feedback submissions with automated classification';
COMMENT ON COLUMN feedback.user_id IS 'Foreign key to auth.users - the user who submitted the feedback';
COMMENT ON COLUMN feedback.title IS 'Short title/summary of the feedback (3-200 chars)';
COMMENT ON COLUMN feedback.description IS 'Detailed description of the feedback (10-5000 chars)';
COMMENT ON COLUMN feedback.category IS 'Automated category assigned by n8n workflow';
COMMENT ON COLUMN feedback.priority IS 'Automated priority assigned by n8n workflow';
COMMENT ON COLUMN feedback.status IS 'Processing status of the feedback';
