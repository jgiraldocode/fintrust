-- Migration script to add section support to existing database
-- Run this script if you have an existing database

-- Add active_section column to game_state table
ALTER TABLE game_state ADD COLUMN active_section INTEGER DEFAULT NULL;

-- Add section column to questions table
ALTER TABLE questions ADD COLUMN section INTEGER DEFAULT 1;

-- Add section column to scores table (if not exists)
-- Note: SQLite doesn't have a clean way to check if column exists
-- This will fail if column already exists, which is fine
ALTER TABLE scores ADD COLUMN section INTEGER DEFAULT 1;

-- Set all existing questions to section 1
UPDATE questions SET section = 1 WHERE section IS NULL;

-- Update existing scores with section from their question
UPDATE scores
SET section = (
  SELECT q.section
  FROM questions q
  WHERE q.id = scores.question_id
)
WHERE section IS NULL OR section = 0;

