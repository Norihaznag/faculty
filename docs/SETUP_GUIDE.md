# Faculty Education Platform - Setup Guide

## Overview

This is a modern educational resource platform built with:
- **Frontend**: Next.js 13 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL) with Row-Level Security
- **Authentication**: Supabase Auth with email/password
- **Database**: Single comprehensive schema (`DATABASE_SCHEMA_SUPABASE.sql`)

## Quick Setup (5 minutes)

### 1. Environment Setup

Copy the template and add your Supabase credentials:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get these from: [Supabase Dashboard](https://supabase.com) → Project Settings → API

### 2. Database Setup

Run the SQL schema in your Supabase console:

```bash
1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Paste entire contents of DATABASE_SCHEMA_SUPABASE.sql
4. Click "Run"
```

**What this creates:**
- ✅ All 10 tables with proper relationships
- ✅ Row-Level Security (RLS) policies
- ✅ Performance indexes
- ✅ Auto-profile creation on signup
- ✅ Auto-timestamp triggers

### 3. Install Dependencies & Run

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

## Project Structure

```
faculty/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/signup          # User registration
│   │   └── auth/[...nextauth]   # Auth handler
│   ├── auth/                    # Auth pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── admin/                   # Admin dashboard
│   ├── bookmarks/               # Saved lessons
│   ├── lessons/[slug]/          # Lesson viewer
│   ├── my-uploads/              # User uploads
│   ├── resources/               # Resource library
│   ├── subjects/[slug]/         # Subject pages
│   ├── upload/                  # Content upload
│   ├── search/                  # Search page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable React components
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── main-layout.tsx
│   ├── lessons/                 # Lesson components
│   ├── sections/                # Page sections
│   └── ui/                      # Shadcn UI components
├── lib/                          # Utilities & hooks
│   ├── auth.ts                  # Auth configuration
│   ├── auth-context.tsx         # Auth context provider
│   ├── db.ts                    # Database client
│   ├── supabase.ts              # Types & client
│   └── utils.ts                 # Helper functions
├── public/                       # Static assets
├── DATABASE_SCHEMA_SUPABASE.sql  # Complete schema
└── package.json
```

## Database Schema

### Core Tables

#### `profiles`
User profiles with role-based access control
- `id` (uuid, FK auth.users)
- `email` (text)
- `full_name` (text)
- `role` (student|teacher|moderator|admin)
- `avatar_url` (text, optional)
- `is_active` (boolean)

#### `subjects`
Academic subjects/categories
- `id` (uuid)
- `name` (text, unique)
- `slug` (text, unique)
- `description` (text)
- `icon` (text)
- `order_index` (integer)

#### `lessons`
Main educational content
- `id` (uuid)
- `title` (text)
- `slug` (text, unique)
- `content` (text, markdown/html)
- `subject_id` (FK)
- `author_id` (FK profiles)
- `is_published` (boolean)
- `views` (integer)

#### `modules` & `resources`
Hierarchical content organization
- Modules group resources within a subject
- Resources are individual lesson items

#### `bookmarks`
User-saved lessons
- `user_id` (FK)
- `lesson_id` (FK)
- Unique(user_id, lesson_id)

#### `uploads`
Pending content for moderation
- `title` (text)
- `status` (pending|approved|rejected)
- `uploader_id` (FK)
- `reviewed_by` (FK, admin)

#### `tags`
Content categorization
- Used in junction tables: `lesson_tags`, `resource_tags`

## Authentication Flow

### Signup
1. User fills signup form → `/auth/signup`
2. POST to `/api/auth/signup` with email, password, fullName
3. Creates user in Supabase Auth
4. Auto-creates profile with `student` role
5. Redirects to login

### Login
1. User enters credentials → `/auth/login`
2. POST to `/api/auth/[...nextauth]` with email, password
3. Supabase validates credentials
4. Session stored as JWT in httpOnly cookie
5. Redirects to home page

### Auth Context
- `useAuth()` hook provides: `user`, `profile`, `loading`, `isAdmin`, `isTeacher`, `isModerator`
- Auto-syncs with Supabase auth state
- Updates when user logs in/out

## User Roles

| Role | Permissions |
|------|-------------|
| **Student** | Read published lessons, bookmark, upload content (for review) |
| **Teacher** | Create/edit lessons, create modules, publish content |
| **Moderator** | Review uploads, approve/reject content |
| **Admin** | Full control: manage users, subjects, content, moderation |

## Key Features

✅ **Role-Based Access Control (RBAC)**
- Row-Level Security (RLS) policies for all tables
- Automatic permission checks

✅ **Content Management**
- Create/edit lessons with markdown support
- Organize content by subject and module
- Tag system for categorization

✅ **User Features**
- Bookmark favorite lessons
- Upload new content for moderation
- View profile and settings

✅ **Admin Dashboard**
- Manage subjects and lessons
- Review pending uploads
- User management

✅ **Performance**
- Optimized indexes on frequently queried fields
- Full-text search on lessons and tags

## Development

### Add New Table
1. Create table in `DATABASE_SCHEMA_SUPABASE.sql`
2. Run migration in Supabase SQL editor
3. Add RLS policies
4. Update types in `lib/supabase.ts`

### Add New Policy
Example: Allow teachers to delete own lessons

```sql
CREATE POLICY "Teachers can delete own lessons"
  ON lessons FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid() AND
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'teacher'
    )
  );
```

### Test Queries
Use Supabase → SQL Editor to test queries

```sql
-- Check policies are working
SELECT * FROM lessons WHERE is_published = true;

-- View active users
SELECT id, email, role, is_active FROM profiles;

-- Check uploads waiting for moderation
SELECT * FROM uploads WHERE status = 'pending';
```

## Deployment

### Netlify
- Connected via `netlify.toml`
- Auto-deploys from git
- Environment variables configured in Netlify dashboard

### Supabase
- Database automatically hosted
- RLS policies enforce security
- No manual scaling needed

## Troubleshooting

### Auth not working
- Check `.env.local` has correct Supabase keys
- Verify profiles table exists: `SELECT COUNT(*) FROM profiles;`
- Check RLS policies allow user access

### Can't see published lessons
- Ensure `is_published = true`
- Check RLS policy allows SELECT
- Verify user role permissions

### Permission denied errors
- Check user role in profiles table
- Verify RLS policies for that operation
- Ensure user is authenticated

## Support

For issues:
1. Check Supabase logs: Supabase → Logs
2. Check Next.js console: `npm run dev`
3. Review RLS policies in Supabase SQL editor

---

**Created**: December 2025
**Stack**: Next.js, Supabase, TypeScript, Tailwind CSS
**Database**: PostgreSQL with Row-Level Security
