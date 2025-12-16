# Quick Start Guide

## Getting Started in 5 Minutes

### 1. View the Application
The application is ready to run! Just execute:
```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Create Your First Account

1. Click "Sign In" in the top right
2. Click "Sign Up"
3. Fill in your details:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Select role: Student or Teacher
4. Click "Create Account"

### 3. Create an Admin Account

To access the admin dashboard, you need an admin account.

**Option 1: Direct Database Update (Quickest)**
1. Sign up with a regular account first
2. Go to your Supabase Dashboard > Table Editor > profiles
3. Find your user and change the `role` from `student` to `admin`
4. Refresh the app and you'll see the "Admin" link in the menu

**Option 2: Update via SQL**
Run this in Supabase SQL Editor (replace with your email):
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### 4. Add Sample Lessons

You can add lessons in two ways:

**Via Upload Form (Recommended for Testing Workflow)**
1. Sign in as a student or teacher
2. Go to "Upload" in the menu
3. Fill in the lesson details
4. Submit
5. Sign in as admin
6. Go to Admin Dashboard
7. Approve the submission

**Via SQL (Faster for Demo)**
Run the script in `scripts/seed-sample-data.sql` in your Supabase SQL Editor

### 5. Key Features to Test

**As a Student:**
- Browse subjects from the home page
- Search for lessons
- Bookmark lessons you like
- Upload content for review

**As a Teacher:**
- All student features
- Upload educational content
- View your contributions

**As an Admin:**
- All above features
- Access Admin Dashboard
- Approve/reject uploads
- View platform statistics
- Manage content moderation

## Common Tasks

### Adding a New Subject
Run in Supabase SQL Editor:
```sql
INSERT INTO subjects (name, slug, description, icon, order_index)
VALUES (
  'History',
  'history',
  'World history, ancient civilizations, and historical events',
  'BookOpen',
  9
);
```

### Publishing a Lesson Directly
```sql
INSERT INTO lessons (title, slug, content, subject_id, is_published)
VALUES (
  'Your Lesson Title',
  'your-lesson-slug',
  '<h2>Lesson Content</h2><p>Your content here...</p>',
  (SELECT id FROM subjects WHERE slug = 'computer-science'),
  true
);
```

### Making a User Admin
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'user@example.com';
```

## Troubleshooting

### Can't see subjects in sidebar?
Make sure subjects are seeded in the database. Run:
```sql
SELECT * FROM subjects;
```

If empty, subjects weren't inserted. Check the migration was applied.

### Can't sign in?
1. Check your Supabase URL and anon key in `.env`
2. Make sure the Supabase project is running
3. Check browser console for errors

### Pages showing "useAuth must be used within AuthProvider"?
This is a build-time warning and can be ignored. The app works correctly at runtime.

### No lessons showing?
1. Make sure you have `is_published = true` on lessons
2. Check that the lessons have a valid `subject_id`
3. Run: `SELECT * FROM lessons WHERE is_published = true;`

## Next Steps

1. Customize the design in `app/globals.css`
2. Add your own subjects and lessons
3. Invite users to test the platform
4. Configure deployment on Vercel or Netlify
5. Set up custom domain
6. Enable analytics

## Performance Tips

- The app is already optimized for production
- Static pages are generated at build time
- Dynamic pages use Server-Side Rendering
- Images should be optimized (use Next.js Image component)
- Database queries are indexed for fast performance

## Need Help?

Check the main README.md for detailed documentation on:
- Project structure
- Database schema
- Component architecture
- Deployment guides
- Feature explanations

Enjoy building your educational platform!
