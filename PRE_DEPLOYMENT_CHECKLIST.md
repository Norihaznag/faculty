# ✅ Pre-Deployment Checklist

## Backend Setup

### Database
- [ ] Copy entire `DATABASE_SCHEMA_SUPABASE.sql` content
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Click "New Query" and paste the SQL
- [ ] Click "Run" to execute
- [ ] Wait for success message

### Environment Variables
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Verify variables are in `.env.local`

### Dependencies
- [ ] Run `npm install`
- [ ] Verify no errors during install
- [ ] Check `node_modules` has supabase packages

## Testing

### Authentication
- [ ] Create test account via signup page
- [ ] Verify profile created in Supabase
- [ ] Login with test account
- [ ] Verify session persists on page refresh
- [ ] Logout and verify redirect to home

### Database Operations
- [ ] Create a subject (admin only)
- [ ] Create a lesson (teacher role)
- [ ] Bookmark a lesson (student)
- [ ] View bookmarks
- [ ] Check queries in Supabase logs

### Permissions
- [ ] Verify student can't create lessons
- [ ] Verify teacher can create lessons
- [ ] Verify admin can see all uploads
- [ ] Verify moderator can approve uploads

### Frontend
- [ ] No console errors in browser
- [ ] Header shows correct user info
- [ ] Navigation links work
- [ ] Search functionality works
- [ ] Mobile responsive

## Code Quality

- [ ] No TypeScript errors: `npm run typecheck`
- [ ] No linting errors: `npm run lint`
- [ ] All imports resolve correctly
- [ ] No unused dependencies
- [ ] No console.log() left in production code

## Deployment

### Netlify
- [ ] Connected to git repository
- [ ] Build command configured: `npm run build`
- [ ] Start command: `npm run start`
- [ ] Environment variables added to Netlify dashboard

### Supabase
- [ ] Project created
- [ ] Custom domain (optional)
- [ ] Backups enabled
- [ ] RLS policies active

## Final Verification

```bash
# Run locally first
npm run dev

# Test signup flow
# Test login flow
# Test core features
# Check network tab for auth calls

# Build for production
npm run build

# No build errors should appear
```

## Rollback Plan (If Needed)

If database schema needs reset:
```sql
-- Drop all tables
DROP TABLE IF EXISTS resource_tags CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS uploads CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS lesson_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop types
DROP TYPE IF EXISTS resource_type CASCADE;
DROP TYPE IF EXISTS upload_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
```

Then re-run `DATABASE_SCHEMA_SUPABASE.sql`

## Documentation Review

- [ ] Read SETUP_GUIDE.md
- [ ] Read MIGRATION_COMPLETE.md
- [ ] Understand table schema
- [ ] Know how to add new features

## Monitoring

After deployment:
- [ ] Monitor Supabase logs daily
- [ ] Check error rates in analytics
- [ ] Review user signup trends
- [ ] Monitor database performance

---

**Checklist Version**: 1.0
**Date**: December 24, 2025
**Status**: Ready for deployment ✅
