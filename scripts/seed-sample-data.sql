-- Sample data for EduHub platform
-- Run this SQL in your Supabase SQL editor to populate initial data

-- Note: You'll need to create an admin user first through the signup process
-- Then get their user ID and update the author_id in the INSERT statements below

-- Sample Tags
INSERT INTO tags (name, slug) VALUES
  ('Beginner', 'beginner'),
  ('Intermediate', 'intermediate'),
  ('Advanced', 'advanced'),
  ('Tutorial', 'tutorial'),
  ('Theory', 'theory'),
  ('Practice', 'practice'),
  ('Programming', 'programming'),
  ('Mathematics', 'mathematics'),
  ('Science', 'science')
ON CONFLICT (slug) DO NOTHING;

-- Sample Lessons for Computer Science
-- Replace 'YOUR_USER_ID' with an actual user ID from the profiles table
DO $$
DECLARE
  cs_subject_id uuid;
  math_subject_id uuid;
  physics_subject_id uuid;
  beginner_tag_id uuid;
  tutorial_tag_id uuid;
  programming_tag_id uuid;
BEGIN
  -- Get subject IDs
  SELECT id INTO cs_subject_id FROM subjects WHERE slug = 'computer-science';
  SELECT id INTO math_subject_id FROM subjects WHERE slug = 'mathematics';
  SELECT id INTO physics_subject_id FROM subjects WHERE slug = 'physics';

  -- Get tag IDs
  SELECT id INTO beginner_tag_id FROM tags WHERE slug = 'beginner';
  SELECT id INTO tutorial_tag_id FROM tags WHERE slug = 'tutorial';
  SELECT id INTO programming_tag_id FROM tags WHERE slug = 'programming';

  -- Insert sample lessons
  INSERT INTO lessons (title, slug, content, subject_id, is_published, views) VALUES
    (
      'Introduction to Python Programming',
      'introduction-to-python-programming',
      '<h2>What is Python?</h2><p>Python is a high-level, interpreted programming language known for its simplicity and readability. It was created by Guido van Rossum and first released in 1991.</p><h2>Why Learn Python?</h2><ul><li>Easy to learn and read</li><li>Versatile and powerful</li><li>Large community and ecosystem</li><li>Used in web development, data science, AI, and more</li></ul><h2>Your First Python Program</h2><pre><code>print("Hello, World!")</code></pre>',
      cs_subject_id,
      true,
      150
    ),
    (
      'JavaScript Fundamentals',
      'javascript-fundamentals',
      '<h2>Introduction to JavaScript</h2><p>JavaScript is the programming language of the web. It allows you to create interactive and dynamic web pages.</p><h2>Variables and Data Types</h2><p>In JavaScript, you can declare variables using let, const, or var:</p><pre><code>let name = "John";\nconst age = 25;\nvar city = "New York";</code></pre><h2>Functions</h2><pre><code>function greet(name) {\n  return "Hello, " + name;\n}</code></pre>',
      cs_subject_id,
      true,
      200
    ),
    (
      'Data Structures: Arrays and Lists',
      'data-structures-arrays-and-lists',
      '<h2>Understanding Arrays</h2><p>An array is a collection of elements stored at contiguous memory locations. It is one of the most commonly used data structures.</p><h2>Array Operations</h2><ul><li>Insertion: O(1) at end, O(n) at beginning</li><li>Deletion: O(1) at end, O(n) at beginning</li><li>Access: O(1) by index</li><li>Search: O(n) for unsorted, O(log n) for sorted</li></ul>',
      cs_subject_id,
      true,
      95
    ),
    (
      'Introduction to Calculus',
      'introduction-to-calculus',
      '<h2>What is Calculus?</h2><p>Calculus is the mathematical study of continuous change. It has two major branches: differential calculus and integral calculus.</p><h2>Limits</h2><p>The limit is the fundamental concept of calculus. It describes the behavior of a function as its input approaches a certain value.</p><h2>Derivatives</h2><p>A derivative represents the rate of change of a function. It is the slope of the tangent line to the function at a given point.</p>',
      math_subject_id,
      true,
      120
    ),
    (
      'Linear Algebra Basics',
      'linear-algebra-basics',
      '<h2>Vectors and Matrices</h2><p>Linear algebra is the branch of mathematics concerning linear equations, linear functions, and their representations through matrices and vector spaces.</p><h2>Matrix Operations</h2><ul><li>Addition and Subtraction</li><li>Scalar Multiplication</li><li>Matrix Multiplication</li><li>Transpose</li><li>Determinant</li></ul>',
      math_subject_id,
      true,
      85
    ),
    (
      'Newtons Laws of Motion',
      'newtons-laws-of-motion',
      '<h2>The Three Laws</h2><h3>First Law (Law of Inertia)</h3><p>An object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an external force.</p><h3>Second Law</h3><p>The acceleration of an object depends on the mass of the object and the force applied. F = ma</p><h3>Third Law</h3><p>For every action, there is an equal and opposite reaction.</p>',
      physics_subject_id,
      true,
      175
    )
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- Note: To link lessons with tags, you'll need to get the lesson IDs first
-- Example:
-- INSERT INTO lesson_tags (lesson_id, tag_id)
-- SELECT l.id, t.id
-- FROM lessons l, tags t
-- WHERE l.slug = 'introduction-to-python-programming'
-- AND t.slug IN ('beginner', 'tutorial', 'programming');
