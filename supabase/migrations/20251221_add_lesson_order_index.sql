-- Add order_index column to lessons table for W3Schools-style ordering
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- Create index for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_lessons_subject_order ON lessons(subject_id, order_index);

-- Update existing lessons to have sequential order within their subjects
WITH ranked_lessons AS (
  SELECT 
    id,
    subject_id,
    ROW_NUMBER() OVER (PARTITION BY subject_id ORDER BY created_at ASC) as row_num
  FROM lessons
)
UPDATE lessons
SET order_index = ranked_lessons.row_num - 1
FROM ranked_lessons
WHERE lessons.id = ranked_lessons.id AND lessons.order_index = 0;
