/*
================================================================================
DATABASE SEEDING SCRIPT - DUMMY DATA FOR TESTING
================================================================================

This script populates your database with realistic dummy data to test
how the site looks with actual content.

IMPORTANT: SETUP STEPS
=======================
1. Run DATABASE_SCHEMA_SUPABASE.sql first
2. Run DATABASE_FIXES_USER_MANAGEMENT.sql second
3. CREATE TEST AUTH USERS in Supabase Auth panel:
   - teacher1@faculty.edu (password: any)
   - teacher2@faculty.edu (password: any)
   - teacher3@faculty.edu (password: any)
   - admin@faculty.edu (password: any)
   - student1@faculty.edu (password: any)
   - student2@faculty.edu (password: any)
   
4. The trigger will automatically create profiles for these emails
5. THEN run this seeding script

Execute: Just paste this into Supabase SQL Editor and run
================================================================================
*/

-- ============================================================================
-- 1. INSERT SAMPLE SUBJECTS
-- ============================================================================

INSERT INTO subjects (id, name, slug, description, icon, order_index) VALUES
  (gen_random_uuid(), 'Mathematics', 'mathematics', 'Learn algebra, geometry, calculus, and advanced math topics from basics to advanced levels', '📐', 1),
  (gen_random_uuid(), 'Physics', 'physics', 'Explore mechanics, thermodynamics, optics, and modern physics concepts', '⚛️', 2),
  (gen_random_uuid(), 'Chemistry', 'chemistry', 'Chemistry fundamentals, reactions, organic chemistry and practical applications', '🧪', 3),
  (gen_random_uuid(), 'Biology', 'biology', 'Study cells, genetics, evolution, ecology and living organisms', '🧬', 4),
  (gen_random_uuid(), 'English', 'english', 'English language, literature, writing skills and communication', '📚', 5),
  (gen_random_uuid(), 'History', 'history', 'World history, civilizations, and historical events', '🏛️', 6),
  (gen_random_uuid(), 'Computer Science', 'computer-science', 'Programming, algorithms, data structures and computer science fundamentals', '💻', 7),
  (gen_random_uuid(), 'Economics', 'economics', 'Microeconomics, macroeconomics, and economic theories', '💰', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. INSERT SAMPLE TAGS
-- ============================================================================

INSERT INTO tags (id, name, slug) VALUES
  (gen_random_uuid(), 'Beginner', 'beginner'),
  (gen_random_uuid(), 'Intermediate', 'intermediate'),
  (gen_random_uuid(), 'Advanced', 'advanced'),
  (gen_random_uuid(), 'Tutorial', 'tutorial'),
  (gen_random_uuid(), 'Practice', 'practice'),
  (gen_random_uuid(), 'Reference', 'reference'),
  (gen_random_uuid(), 'Exam Prep', 'exam-prep'),
  (gen_random_uuid(), 'Interactive', 'interactive'),
  (gen_random_uuid(), 'Video', 'video'),
  (gen_random_uuid(), 'Case Study', 'case-study')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 3. INSERT SAMPLE TEACHER PROFILES
-- NOTE: Profiles are auto-created by the trigger when auth users sign up.
-- This script uses email-based lookups instead of hardcoded IDs.
-- If profiles don't exist, you need to:
-- 1. Create auth users in Supabase Auth with these emails
-- 2. The trigger will automatically create corresponding profiles
-- ============================================================================

-- Optionally update profile details if they exist:
UPDATE profiles SET full_name = 'Dr. Sarah Johnson', role = 'teacher', avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' WHERE email = 'teacher1@faculty.edu';
UPDATE profiles SET full_name = 'Prof. Michael Chen', role = 'teacher', avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' WHERE email = 'teacher2@faculty.edu';
UPDATE profiles SET full_name = 'Dr. Emma Wilson', role = 'teacher', avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' WHERE email = 'teacher3@faculty.edu';
UPDATE profiles SET full_name = 'Admin User', role = 'admin', avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' WHERE email = 'admin@faculty.edu';
UPDATE profiles SET full_name = 'Alex Smith', role = 'student', avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' WHERE email = 'student1@faculty.edu';
UPDATE profiles SET full_name = 'Jordan Davis', role = 'student', avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' WHERE email = 'student2@faculty.edu';

-- ============================================================================
-- 4. INSERT SAMPLE LESSONS (Main Content)
-- ============================================================================

WITH math_subject AS (
  SELECT id FROM subjects WHERE slug = 'mathematics' LIMIT 1
),
physics_subject AS (
  SELECT id FROM subjects WHERE slug = 'physics' LIMIT 1
),
chemistry_subject AS (
  SELECT id FROM subjects WHERE slug = 'chemistry' LIMIT 1
),
teacher1 AS (
  SELECT id FROM profiles WHERE email = 'teacher1@faculty.edu' LIMIT 1
),
teacher2 AS (
  SELECT id FROM profiles WHERE email = 'teacher2@faculty.edu' LIMIT 1
),
teacher3 AS (
  SELECT id FROM profiles WHERE email = 'teacher3@faculty.edu' LIMIT 1
)
INSERT INTO lessons (title, slug, content, subject_id, semester, author_id, views, is_published, order_index) VALUES
  -- Mathematics Lessons
  (
    'Algebra Fundamentals: Linear Equations',
    'algebra-linear-equations',
    '<h2>Introduction to Linear Equations</h2><p>Learn how to solve linear equations step by step. This comprehensive guide covers:</p><ul><li>Basic equation solving</li><li>Properties of equality</li><li>Multi-step equations</li><li>Checking solutions</li></ul><p>Perfect for beginners who want to master algebraic fundamentals.</p>',
    (SELECT id FROM math_subject),
    'Fall 2025',
    (SELECT id FROM teacher1),
    1250,
    true,
    1
  ),
  (
    'Calculus: Limits and Continuity',
    'calculus-limits-continuity',
    '<h2>Understanding Limits</h2><p>Limits form the foundation of calculus. This lesson explores:</p><ul><li>Definition of limits</li><li>One-sided limits</li><li>Infinite limits</li><li>Continuity</li></ul><p>Complete with examples and practice problems.</p>',
    (SELECT id FROM math_subject),
    'Spring 2025',
    (SELECT id FROM teacher1),
    890,
    true,
    2
  ),
  (
    'Geometry: Triangles and Angles',
    'geometry-triangles-angles',
    '<h2>Triangle Properties and Angle Relationships</h2><p>Master the properties of triangles:</p><ul><li>Triangle inequality</li><li>Angle sum theorem</li><li>Congruent triangles</li><li>Similar triangles</li><li>Special triangles</li></ul>',
    (SELECT id FROM math_subject),
    'Fall 2024',
    (SELECT id FROM teacher1),
    560,
    true,
    3
  ),
  -- Physics Lessons
  (
    'Mechanics: Newton''s Laws of Motion',
    'mechanics-newtons-laws',
    '<h2>Understanding Newton''s Three Laws</h2><p>The foundation of classical mechanics:</p><ul><li>First Law: Inertia</li><li>Second Law: F=ma</li><li>Third Law: Action-Reaction</li></ul><p>Learn how to apply these laws to solve real-world problems.</p>',
    (SELECT id FROM physics_subject),
    'Fall 2025',
    (SELECT id FROM teacher2),
    2100,
    true,
    1
  ),
  (
    'Thermodynamics: Heat and Energy',
    'thermodynamics-heat-energy',
    '<h2>Introduction to Thermodynamics</h2><p>Explore the science of heat and energy:</p><ul><li>Temperature and heat</li><li>First law of thermodynamics</li><li>Second law and entropy</li><li>Applications in engines</li></ul>',
    (SELECT id FROM physics_subject),
    'Spring 2025',
    (SELECT id FROM teacher2),
    1450,
    true,
    2
  ),
  -- Chemistry Lessons
  (
    'Organic Chemistry: Hydrocarbons',
    'organic-chemistry-hydrocarbons',
    '<h2>Understanding Hydrocarbons</h2><p>The building blocks of organic chemistry:</p><ul><li>Alkanes, alkenes, alkynes</li><li>Structural isomerism</li><li>Naming conventions (IUPAC)</li><li>Properties and reactions</li></ul><p>Essential foundation for advanced organic chemistry.</p>',
    (SELECT id FROM chemistry_subject),
    'Fall 2025',
    (SELECT id FROM teacher3),
    980,
    true,
    1
  ),
  (
    'Chemical Bonding and Molecular Structure',
    'chemical-bonding-molecular-structure',
    '<h2>Bonds and Molecular Geometry</h2><p>Learn how atoms bond together:</p><ul><li>Ionic bonds</li><li>Covalent bonds</li><li>Metallic bonds</li><li>VSEPR theory</li><li>Molecular geometry</li></ul>',
    (SELECT id FROM chemistry_subject),
    'Spring 2025',
    (SELECT id FROM teacher3),
    720,
    true,
    2
  );

-- ============================================================================
-- 5. INSERT MODULES (Hierarchical Structure)
-- ============================================================================

WITH math_subject AS (
  SELECT id FROM subjects WHERE slug = 'mathematics' LIMIT 1
),
physics_subject AS (
  SELECT id FROM subjects WHERE slug = 'physics' LIMIT 1
),
cs_subject AS (
  SELECT id FROM subjects WHERE slug = 'computer-science' LIMIT 1
)
INSERT INTO modules (subject_id, name, slug, description, order_index) VALUES
  -- Mathematics Modules
  (
    (SELECT id FROM math_subject),
    'Algebra & Equations',
    'algebra-equations',
    'Master algebraic concepts from basics to advanced equations',
    1
  ),
  (
    (SELECT id FROM math_subject),
    'Calculus Fundamentals',
    'calculus-fundamentals',
    'Learn limits, derivatives, and integrals',
    2
  ),
  (
    (SELECT id FROM math_subject),
    'Geometry & Trigonometry',
    'geometry-trigonometry',
    'Explore shapes, angles, and trigonometric functions',
    3
  ),
  -- Physics Modules
  (
    (SELECT id FROM physics_subject),
    'Classical Mechanics',
    'classical-mechanics',
    'Forces, motion, and energy in classical physics',
    1
  ),
  (
    (SELECT id FROM physics_subject),
    'Waves & Optics',
    'waves-optics',
    'Light, sound, and wave phenomena',
    2
  ),
  (
    (SELECT id FROM physics_subject),
    'Thermodynamics & Kinetics',
    'thermodynamics-kinetics',
    'Heat, temperature, and molecular motion',
    3
  ),
  -- Computer Science Modules
  (
    (SELECT id FROM cs_subject),
    'Programming Basics',
    'programming-basics',
    'Introduction to programming concepts and syntax',
    1
  ),
  (
    (SELECT id FROM cs_subject),
    'Data Structures',
    'data-structures',
    'Arrays, linked lists, trees, and graphs',
    2
  ),
  (
    (SELECT id FROM cs_subject),
    'Algorithms',
    'algorithms',
    'Sorting, searching, and optimization algorithms',
    3
  );

-- ============================================================================
-- 6. INSERT RESOURCES (Content within Modules)
-- ============================================================================

WITH algebra_module AS (
  SELECT id, subject_id FROM modules WHERE slug = 'algebra-equations' LIMIT 1
),
teacher1 AS (
  SELECT id FROM profiles WHERE email = 'teacher1@faculty.edu' LIMIT 1
),
teacher2 AS (
  SELECT id FROM profiles WHERE email = 'teacher2@faculty.edu' LIMIT 1
),
beginner_tag AS (
  SELECT id FROM tags WHERE slug = 'beginner' LIMIT 1
),
tutorial_tag AS (
  SELECT id FROM tags WHERE slug = 'tutorial' LIMIT 1
),
practice_tag AS (
  SELECT id FROM tags WHERE slug = 'practice' LIMIT 1
)
INSERT INTO resources (module_id, subject_id, title, slug, description, resource_type, content, author_id, is_published, order_index, views) VALUES
  (
    (SELECT id FROM algebra_module),
    (SELECT subject_id FROM algebra_module),
    'Variables and Expressions',
    'variables-and-expressions',
    'Learn how to work with variables and algebraic expressions',
    'lesson',
    '<h2>Algebraic Expressions</h2><p>An algebraic expression is a mathematical phrase using variables and operations.</p><p>Examples: 2x + 5, 3a² - 2a + 1</p>',
    (SELECT id FROM teacher1),
    true,
    1,
    450
  ),
  (
    (SELECT id FROM algebra_module),
    (SELECT subject_id FROM algebra_module),
    'One-Step Equations',
    'solving-one-step-equations',
    'Master solving simple linear equations',
    'lesson',
    '<h2>One-Step Equations</h2><p>Equations that require only one operation to solve.</p><p>Practice: x + 5 = 12, 3x = 15</p>',
    (SELECT id FROM teacher1),
    true,
    2,
    380
  ),
  (
    (SELECT id FROM algebra_module),
    (SELECT subject_id FROM algebra_module),
    'Algebra Practice Set 1',
    'algebra-practice-set-1',
    'Practice problems for algebraic fundamentals',
    'practice',
    '<h2>Practice Problems</h2><p>20 problems to test your understanding of algebraic concepts.</p>',
    (SELECT id FROM teacher1),
    true,
    3,
    310
  );

-- ============================================================================
-- 7. ATTACH TAGS TO LESSONS
-- ============================================================================

WITH beginner_tag AS (SELECT id FROM tags WHERE slug = 'beginner' LIMIT 1),
tutorial_tag AS (SELECT id FROM tags WHERE slug = 'tutorial' LIMIT 1),
practice_tag AS (SELECT id FROM tags WHERE slug = 'practice' LIMIT 1),
intermediate_tag AS (SELECT id FROM tags WHERE slug = 'intermediate' LIMIT 1),
advanced_tag AS (SELECT id FROM tags WHERE slug = 'advanced' LIMIT 1)
INSERT INTO lesson_tags (lesson_id, tag_id) 
SELECT l.id, (SELECT id FROM beginner_tag) 
FROM lessons l WHERE l.slug LIKE 'algebra%' OR l.slug LIKE 'geometry%'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. INSERT SAMPLE BOOKMARKS (User Favorites)
-- ============================================================================

WITH student1 AS (
  SELECT id FROM profiles WHERE email = 'student1@faculty.edu' LIMIT 1
),
student2 AS (
  SELECT id FROM profiles WHERE email = 'student2@faculty.edu' LIMIT 1
),
lesson1 AS (
  SELECT id FROM lessons WHERE slug = 'algebra-linear-equations' LIMIT 1
),
lesson2 AS (
  SELECT id FROM lessons WHERE slug = 'mechanics-newtons-laws' LIMIT 1
),
lesson3 AS (
  SELECT id FROM lessons WHERE slug = 'calculus-limits-continuity' LIMIT 1
)
INSERT INTO bookmarks (user_id, lesson_id) VALUES
  ((SELECT id FROM student1), (SELECT id FROM lesson1)),
  ((SELECT id FROM student1), (SELECT id FROM lesson2)),
  ((SELECT id FROM student2), (SELECT id FROM lesson1)),
  ((SELECT id FROM student2), (SELECT id FROM lesson3)),
  ((SELECT id FROM student1), (SELECT id FROM lesson3))
ON CONFLICT (user_id, lesson_id) DO NOTHING;

-- ============================================================================
-- 9. INSERT SAMPLE UPLOADS (Pending Content)
-- ============================================================================

WITH student1 AS (
  SELECT id FROM profiles WHERE email = 'student1@faculty.edu' LIMIT 1
),
student2 AS (
  SELECT id FROM profiles WHERE email = 'student2@faculty.edu' LIMIT 1
),
math_subject AS (
  SELECT id FROM subjects WHERE slug = 'mathematics' LIMIT 1
),
cs_subject AS (
  SELECT id FROM subjects WHERE slug = 'computer-science' LIMIT 1
)
INSERT INTO uploads (title, content, subject_id, semester, tags, uploader_id, status) VALUES
  (
    'Quick Guide to Quadratic Equations',
    'A comprehensive guide covering quadratic formulas, factoring, and completing the square with step-by-step examples.',
    (SELECT id FROM math_subject),
    'Fall 2025',
    ARRAY['quadratic', 'equations', 'beginner'],
    (SELECT id FROM student1),
    'pending'
  ),
  (
    'Introduction to Python for Beginners',
    'Learn Python programming from scratch with practical examples and hands-on exercises.',
    (SELECT id FROM cs_subject),
    'Spring 2025',
    ARRAY['python', 'programming', 'beginner', 'tutorial'],
    (SELECT id FROM student2),
    'pending'
  ),
  (
    'Statistics and Probability Concepts',
    'Master statistical analysis, probability theory, and real-world applications.',
    (SELECT id FROM math_subject),
    'Fall 2025',
    ARRAY['statistics', 'probability', 'intermediate'],
    (SELECT id FROM student1),
    'pending'
  );

-- ============================================================================
-- 10. VERIFICATION QUERIES (Run these to verify data was inserted)
-- ============================================================================

-- Count inserted data:
-- SELECT 
--   'Subjects' as table_name, COUNT(*) as count FROM subjects
-- UNION ALL
-- SELECT 'Tags', COUNT(*) FROM tags
-- UNION ALL
-- SELECT 'Profiles', COUNT(*) FROM profiles
-- UNION ALL
-- SELECT 'Lessons', COUNT(*) FROM lessons
-- UNION ALL
-- SELECT 'Modules', COUNT(*) FROM modules
-- UNION ALL
-- SELECT 'Resources', COUNT(*) FROM resources
-- UNION ALL
-- SELECT 'Bookmarks', COUNT(*) FROM bookmarks
-- UNION ALL
-- SELECT 'Uploads', COUNT(*) FROM uploads;

-- View all published lessons:
-- SELECT title, slug, subject_id, author_id, views FROM lessons WHERE is_published = true ORDER BY views DESC;

-- View all modules with their subjects:
-- SELECT s.name as subject, m.name as module, m.slug FROM modules m JOIN subjects s ON m.subject_id = s.id ORDER BY s.name;

-- View all pending uploads:
-- SELECT title, uploader_id, status, created_at FROM uploads WHERE status = 'pending' ORDER BY created_at DESC;

/*
================================================================================
SEEDING COMPLETE!

Your database now contains:
- 8 academic subjects
- 10 tags for categorization
- 6 sample user profiles (teachers, admin, students)
- 7 published lessons across different subjects
- 9 modules organized by subject
- 3 resources within modules
- 5 sample bookmarks
- 3 pending uploads awaiting approval

You can now:
1. View lessons, modules, and resources in your site
2. Browse different subjects
3. See how bookmarks work
4. Test admin functions on pending uploads
5. Check user profiles and roles

NEXT STEPS:
- Log in with teacher/student accounts to test functionality
- Upload more content as pending items
- Create more modules and resources
- Test filtering and search by tags
- Verify role-based access controls

================================================================================
*/
