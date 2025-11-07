-- Migration Script: Normalize score values to 0-100 scale
-- Date: 2025-11-07
-- Purpose: Convert old scoring system (0-1) to new system (0-100)
--
-- Background:
-- - Old system stored is_correct as 0 (incorrect) or 1 (correct)
-- - New system stores is_correct as 0-100 (percentage)
-- - This migration converts old values to the new scale
--
-- IMPORTANT: This migration is idempotent and safe to run multiple times

-- Step 1: Convert old single-answer scores (1 → 100)
UPDATE scores
SET is_correct = 100
WHERE is_correct = 1;

-- Step 2: Verify no values between 2-69 exist (these would be invalid)
-- Note: Valid values are 0, or 70-100
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN 'OK: No invalid scores found'
    ELSE 'WARNING: Found ' || COUNT(*) || ' scores with invalid values (2-69)'
  END as validation_result
FROM scores
WHERE is_correct > 1 AND is_correct < 70;

-- Step 3: Show current score distribution
SELECT
  CASE
    WHEN is_correct = 0 THEN '0% (Incorrect)'
    WHEN is_correct >= 70 AND is_correct < 100 THEN '70-99% (Partial Credit)'
    WHEN is_correct = 100 THEN '100% (Correct)'
    ELSE 'INVALID: ' || is_correct
  END as score_range,
  COUNT(*) as count
FROM scores
GROUP BY
  CASE
    WHEN is_correct = 0 THEN '0% (Incorrect)'
    WHEN is_correct >= 70 AND is_correct < 100 THEN '70-99% (Partial Credit)'
    WHEN is_correct = 100 THEN '100% (Correct)'
    ELSE 'INVALID: ' || is_correct
  END
ORDER BY
  CASE
    WHEN is_correct = 0 THEN 1
    WHEN is_correct >= 70 AND is_correct < 100 THEN 2
    WHEN is_correct = 100 THEN 3
    ELSE 4
  END;

-- Step 4: Show sample leaderboard to verify correct calculations
SELECT
  u.name,
  COUNT(s.id) as total_answers,
  SUM(CASE WHEN s.is_correct >= 70 THEN 1 ELSE 0 END) as correct_answers,
  ROUND(COALESCE(AVG(s.is_correct), 0), 2) as score_percentage
FROM users u
LEFT JOIN scores s ON u.id = s.user_id
GROUP BY u.id, u.name
HAVING COUNT(s.id) > 0
ORDER BY score_percentage DESC, MAX(s.answered_at) ASC
LIMIT 10;

-- Migration Complete
-- Expected results:
-- - All is_correct values should be either 0, or 70-100
-- - Leaderboard should show reasonable values (not 300/3 or 10,000%)
-- - correct_answers should be <= total_answers
-- - score_percentage should be between 0 and 100

