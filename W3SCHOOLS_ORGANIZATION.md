# W3Schools-Style Subject & Lesson Organization

## Overview
Your platform now supports W3Schools-style organization where:
- **Faculties** are main subjects (e.g., Computer Science, Mathematics, Biology)
- **Lessons** within each faculty are ordered sequentially for progressive learning
- Each lesson has an `order_index` that determines its position in the faculty's curriculum

## Key Features Implemented

### 1. Database Schema Updates ✅
- Added `order_index` column to lessons table (migration: `20251221_add_lesson_order_index.sql`)
- Existing lessons auto-populated with sequential order based on creation date
- New index on `(subject_id, order_index)` for efficient queries

### 2. Admin Panel - Faculty Management ✅

#### Create Faculties
1. Go to Admin Panel → Faculties tab
2. Click "+ New Faculty"
3. Enter faculty name and optional description
4. Click "Create Faculty"

#### View & Organize Lessons
1. Click on any faculty card to view its lessons
2. See all lessons listed with their current order number
3. Use ↑ and ↓ buttons to reorder lessons
4. Order is persisted immediately to the database

**Admin Interface Location:** `app/admin/page.tsx` - Faculties tab

### 3. Upload Page Enhancement ✅
- Lessons created via upload/approval workflow automatically get `order_index`
- When creating a lesson in a subject, it gets the next sequential order number
- Admins can directly publish lessons (order_index = 0 by default)
- Teachers/moderators submit for approval (will be ordered by admin)

**Upload Interface Location:** `app/upload/page.tsx`

### 4. Sidebar Navigation ✅
- Faculties are displayed in order_index order (not creation date)
- Lessons within each faculty are shown in order_index order
- Clicking to expand a faculty shows lessons in correct progression
- Perfect for W3Schools-style sidebar navigation

**Sidebar Code:** `components/layout/sidebar.tsx` - Now orders by `order_index` instead of `created_at`

### 5. Lesson View Page ✅
- Lessons navigate using order_index (not just date)
- "Previous" and "Next" buttons follow the ordered sequence
- Maintains progression through the curriculum

**Lesson Navigation:** `app/lessons/[slug]/page.tsx`

### 6. W3Schools Lesson Component ✅
- Already supports W3Schools-style layout with sidebar TOC
- Shows lesson position in the curriculum
- Previous/Next navigation follows the ordered sequence

**Component:** `components/lessons/lesson-view-w3style.tsx`

## Database Queries Updated

### Sidebar Lessons Query
```typescript
.order('order_index', { ascending: true })  // Was: created_at
```

### Lesson Navigation Query
```typescript
.order('order_index', { ascending: true })  // Was: created_at
```

### Admin Lessons Query
```typescript
.order('order_index', { ascending: true })
```

## TypeScript Types Updated

### Lesson Type
```typescript
export type Lesson = {
  // ... existing fields ...
  order_index: number;  // NEW: Position within subject
  // ... rest of fields ...
};
```

## Workflow Examples

### Creating a W3Schools-Style Curriculum

1. **Create Faculty**
   - Admin creates "Python Basics" faculty
   - Sets description: "Learn Python from scratch"

2. **Upload Lessons in Order**
   - Lesson 1: "Introduction to Python" (order_index: 0)
   - Lesson 2: "Variables and Data Types" (order_index: 1)
   - Lesson 3: "Control Flow" (order_index: 2)
   - etc.

3. **Reorder if Needed**
   - Go to Admin → Faculties
   - Select "Python Basics"
   - Use ↑ ↓ buttons to reorganize lessons
   - Changes reflect immediately in sidebar and navigation

### Student Experience

1. Student clicks "Python Basics" in sidebar
2. Sees lessons in curriculum order (not by date)
3. Clicks lesson → sees W3Schools-style view with prev/next buttons
4. Navigation follows the order_index sequence
5. Progressive learning path is clear

## API Endpoints & Database Queries

### Create Subject
```sql
INSERT INTO subjects (name, slug, description, order_index)
VALUES ('Python Basics', 'python-basics', 'Learn Python from scratch', 0)
```

### Update Lesson Order
```sql
UPDATE lessons SET order_index = 2 WHERE id = 'lesson-id-123'
```

### Fetch Lessons in Order
```sql
SELECT * FROM lessons 
WHERE subject_id = 'subject-id' AND is_published = true
ORDER BY order_index ASC
```

## Migration Applied

**File:** `supabase/migrations/20251221_add_lesson_order_index.sql`

**Actions:**
1. Adds `order_index` column to lessons (DEFAULT 0)
2. Creates index on (subject_id, order_index) for performance
3. Auto-populates existing lessons with sequential order

**To apply migration:**
```bash
# Push to Supabase
supabase push

# Or run manually in Supabase SQL editor
```

## File Changes Summary

| File | Change | Purpose |
|------|--------|---------|
| `lib/supabase.ts` | Added `order_index: number` to Lesson type | TypeScript support |
| `app/admin/page.tsx` | Added Faculties tab with full management | Admin CRUD for faculties/lessons |
| `components/layout/sidebar.tsx` | Changed order to `order_index` | W3Schools navigation |
| `app/lessons/[slug]/page.tsx` | Changed navigation order to `order_index` | Sequential lesson navigation |
| `supabase/migrations/20251221_add_lesson_order_index.sql` | NEW: Migration file | Database schema update |

## Next Steps (Optional)

### 1. Drag-and-Drop Ordering
- Could upgrade the admin interface to drag-and-drop instead of ↑↓ buttons
- Would provide better UX for reordering many lessons

### 2. Batch Import
- Create CSV import for lessons (title, content, order)
- Would allow bulk creation of curriculums

### 3. Lesson Prerequisites
- Add `prerequisite_lesson_id` field
- Create a dependency graph for learning paths

### 4. Progress Tracking
- Track which lessons each user has completed
- Show progress bar in sidebar
- Suggest next lesson

### 5. Curriculum Templates
- Pre-built curriculum templates for common subjects
- One-click curriculum creation

## Testing Checklist

- [ ] Create a new faculty via Admin panel
- [ ] Upload/create multiple lessons in that faculty
- [ ] Verify lessons appear in sidebar in order
- [ ] Click lesson to view (check W3Schools layout)
- [ ] Use ↑↓ buttons to reorder lessons
- [ ] Verify order persists on page reload
- [ ] Test Previous/Next navigation at bottom
- [ ] Check order_index in database directly

## Support

For questions or issues:
1. Check Admin → Faculties tab for current structure
2. Verify lessons have `order_index` in database
3. Check console for any query errors
4. Review migration status in Supabase dashboard
