# 🔍 ScholarHub Platform - Critical Bug Analysis

## 🐛 BUG #1: Race Condition in Bookmark State Updates
**Severity:** HIGH | **Component:** lesson-view-w3style.tsx

### 🐛 Bug Summary
The bookmark button can trigger race conditions when users rapidly click the Save/Bookmarked button. If a user clicks while a previous request is in flight, the UI state can become desynchronized from the database.

### 🔍 Root Cause
**Line 32-33:** The `isBookmarked` state is checked AFTER the async operation starts, but the state is updated BEFORE the operation completes. If two clicks happen within the async window:
```tsx
const toggleBookmark = async () => {
  if (!user) return;
  setBookmarkLoading(true);  // ← Set loading
  
  try {
    if (isBookmarked) {  // ← Uses STALE state from closure
      // DELETE operation
      setIsBookmarked(false);  // ← Optimistically updates
    } else {
      // INSERT operation
      setIsBookmarked(true);   // ← Optimistically updates
    }
  }
}
```

**Scenario:**
1. User clicks Save (isBookmarked=false) → DELETE request fires
2. User clicks again immediately (isBookmarked still false in closure) → Another DELETE fires
3. Database now has inconsistent state; UI shows bookmarked but isn't

### 🛠 Fix
Implement proper request deduplication and state locking:

```tsx
const toggleBookmark = async () => {
  if (!user || bookmarkLoading) return;  // ← GUARD: Prevent concurrent requests
  
  const previousState = isBookmarked;    // ← SNAPSHOT current state
  setBookmarkLoading(true);

  try {
    if (previousState) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id);
      
      if (error) throw error;
      setIsBookmarked(false);
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, lesson_id: lesson.id });
      
      if (error) throw error;
      setIsBookmarked(true);
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    setIsBookmarked(previousState);  // ← ROLLBACK on error
  } finally {
    setBookmarkLoading(false);
  }
};
```

### 🧪 How to Test
1. Open lesson in two tabs
2. Rapidly click Save button 5+ times
3. Refresh page - check if bookmark state matches database
4. Check Supabase bookmarks table for duplicate entries

---

## 🐛 BUG #2: Memory Leak in View Count Increment
**Severity:** MEDIUM | **Component:** app/lessons/[slug]/page.tsx

### 🐛 Bug Summary
The view count increment fires on EVERY render without deduplication. In production, concurrent requests to the same lesson cause multiple increments per single user visit.

### 🔍 Root Cause
**Line 47-50:** The Supabase update runs during page render with no idempotency check:
```tsx
// Increment view count
await supabase
  .from('lessons')
  .update({ views: (lesson.views || 0) + 1 })
  .eq('id', lesson.id);
```

**Issues:**
1. Server component renders on cache miss → increments views
2. Revalidation triggers → increments again
3. Each page visit counts as multiple views

**Trace Path:**
- User visits `/lessons/intro-to-react`
- Next.js revalidates ISR → Server component re-runs
- `update()` executes again → view count += 1
- Result: 1 user visit = 2-3 view increments

### 🛠 Fix
Use idempotent update with timestamp-based deduplication:

```tsx
export default async function LessonPage({ params }: Props) {
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*, subject:subjects(*), author:profiles(*)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !lesson) {
    notFound();
  }

  // Track view in separate table with user ID + timestamp
  const userId = null;  // Anonymous views - could use IP or cookie
  const viewKey = `${lesson.id}:${userId}:${new Date().toISOString().split('T')[0]}`;
  
  // Only increment once per day per user
  const { data: existingView } = await supabase
    .from('lesson_views')  // New table: id, lesson_id, user_id, date, created_at
    .select('id')
    .eq('lesson_id', lesson.id)
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 86400000).toISOString())
    .limit(1);

  if (!existingView || existingView.length === 0) {
    // Record new view
    await supabase.from('lesson_views').insert({
      lesson_id: lesson.id,
      user_id: userId,
    });

    // Increment total count (safe because it's once-per-day)
    await supabase
      .from('lessons')
      .update({ views: (lesson.views || 0) + 1 })
      .eq('id', lesson.id);
  }

  // ... rest of code
}
```

### 🧪 How to Test
1. Open lesson page
2. Hard-refresh (Ctrl+Shift+R) 10 times
3. Check view count - should only increase by 1
4. Check database views table for duplicate entries

---

## 🐛 BUG #3: Null Reference Error in Lesson Navigation
**Severity:** MEDIUM | **Component:** app/lessons/[slug]/page.tsx

### 🐛 Bug Summary
If a lesson has no subject (subject_id is NULL), the navigation query fails silently, leaving previousLesson/nextLesson as undefined.

### 🔍 Root Cause
**Line 58-65:** Query assumes `lesson.subject_id` exists:
```tsx
const { data: allLessons } = await supabase
  .from('lessons')
  .select('*, subject:subjects(*), author:profiles(*)')
  .eq('subject_id', lesson.subject_id)  // ← FAILS if NULL
  .eq('is_published', true)
  .order('created_at', { ascending: true });

let previousLesson = null;
let nextLesson = null;

if (allLessons) {
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  if (currentIndex > 0) {
    previousLesson = allLessons[currentIndex - 1];
  }
  // ... but allLessons is EMPTY because subject_id was NULL
}
```

**Edge Case:**
- Orphaned lesson with no faculty assignment
- Query returns empty array
- Navigation shows no Previous/Next (expected but silent failure)

### 🛠 Fix
Add explicit null check and fallback:

```tsx
// Fetch adjacent lessons for navigation (only if lesson has a subject)
let previousLesson = null;
let nextLesson = null;

if (lesson.subject_id) {
  const { data: allLessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('*, subject:subjects(*), author:profiles(*)')
    .eq('subject_id', lesson.subject_id)
    .eq('is_published', true)
    .order('created_at', { ascending: true });

  if (lessonsError) {
    console.error('Error fetching adjacent lessons:', lessonsError);
  }

  if (allLessons && allLessons.length > 0) {
    const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
    if (currentIndex > 0) {
      previousLesson = allLessons[currentIndex - 1];
    }
    if (currentIndex < allLessons.length - 1) {
      nextLesson = allLessons[currentIndex + 1];
    }
  }
} else {
  console.warn(`Lesson "${lesson.title}" has no subject_id assigned`);
}
```

### 🧪 How to Test
1. Create lesson without assigning a faculty
2. Visit that lesson's page
3. Verify navigation section gracefully shows empty state
4. Check console for warning

---

## 🐛 BUG #4: Unbounded Regex in Content Display
**Severity:** LOW | **Component:** lesson-view-w3style.tsx, line 173

### 🐛 Bug Summary
Content displayed with `whitespace-pre-wrap` can break layout if it contains extremely long unbroken strings (URLs, code blocks).

### 🔍 Root Cause
**Line 173:**
```tsx
{lesson.content && (
  <div className="text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap">
    {lesson.content}
  </div>
)}
```

`whitespace-pre-wrap` preserves all whitespace but doesn't break long lines. A lesson with:
```
This is my content https://example.com/very/long/url/that/goes/on/forever/and/ever/and/breaks/the/layout
```

Will cause horizontal scroll on mobile devices.

### 🛠 Fix
Add word-break and max-width constraints:

```tsx
{lesson.content && (
  <div className="text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap break-words overflow-x-auto">
    {lesson.content}
  </div>
)}
```

Or better, sanitize and render HTML properly:

```tsx
import { useMemo } from 'react';
import DOMPurify from 'dompurify';

export function LessonViewW3Style({ lesson, ... }: LessonViewW3StyleProps) {
  const sanitizedContent = useMemo(() => {
    if (!lesson.content) return '';
    // If content is HTML, sanitize it; otherwise treat as plain text
    if (lesson.content.includes('<')) {
      return DOMPurify.sanitize(lesson.content);
    }
    return lesson.content;
  }, [lesson.content]);

  return (
    // ...
    {lesson.content && (
      <div 
        className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    )}
  );
}
```

### 🧪 How to Test
1. Create lesson with long URL without spaces
2. View on mobile (375px width)
3. Verify content doesn't cause horizontal overflow

---

## 🐛 BUG #5: Auth State Synchronization Issue
**Severity:** HIGH | **Component:** lib/auth-context.tsx

### 🐛 Bug Summary
The `fetchProfile` function is called both in `initializeAuth` and in `onAuthStateChange` callback, but `fetchProfile` doesn't check `isMounted` before final state update, causing memory leak warnings.

### 🔍 Root Cause
**Lines 75-85:**
```tsx
const fetchProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    
    if (data && data.is_active === false) {
      await supabase.auth.signOut();
      setProfile(null);  // ← WARNING: Memory leak - no isMounted check
      setUser(null);
      setLoading(false);
      return;
    }
    
    setProfile(data || null);  // ← Same issue
    setLoading(false);
  } catch (error) {
    // ...
  }
};
```

**Race Condition Scenario:**
1. User visits page
2. `onAuthStateChange` fires, calls `fetchProfile`
3. User navigates away before response
4. Component unmounts (`isMounted = false`)
5. Response arrives → `setProfile()` called on unmounted component
6. Memory leak warning in console

### 🛠 Fix
Add isMounted check in fetchProfile:

```tsx
const fetchProfile = async (userId: string, mounted: boolean = true) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    
    if (!mounted) return;  // ← EXIT if unmounted
    
    if (data && data.is_active === false) {
      await supabase.auth.signOut();
      setProfile(null);
      setUser(null);
      setLoading(false);
      return;
    }
    
    setProfile(data || null);
    setLoading(false);
  } catch (error) {
    if (mounted) {  // ← Only set error state if still mounted
      console.error('Error fetching profile:', error);
      setAuthError(error instanceof Error ? error.message : 'Failed to fetch profile');
      setLoading(false);
    }
  }
};

useEffect(() => {
  let isMounted = true;

  const initializeAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (!isMounted) return;
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id, isMounted);  // ← Pass flag
      } else {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
      }
    } catch (error) {
      if (isMounted) {
        setAuthError(error instanceof Error ? error.message : 'Auth initialization failed');
        setLoading(false);
      }
    }
  };

  initializeAuth();

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!isMounted) return;
    
    setUser(session?.user ?? null);
    
    if (session?.user) {
      fetchProfile(session.user.id, isMounted);  // ← Pass flag
    } else {
      setProfile(null);
      setLoading(false);
    }
  });

  return () => {
    isMounted = false;
    subscription.unsubscribe();
  };
}, []);
```

### 🧪 How to Test
1. Open app, wait 2 seconds
2. Navigate away quickly
3. Check browser console for "memory leak" warnings
4. Should see NO warnings after fix

---

## 🐛 BUG #6: Missing Error Handling in Admin Upload Processing
**Severity:** MEDIUM | **Component:** app/admin/page.tsx

### 🐛 Bug Summary
When admin approves an upload that has a new suggested subject, the subject creation and lesson insertion are not transactional. If subject creation succeeds but lesson creation fails, the subject remains orphaned.

### 🔍 Root Cause
**Lines 172-220 (handleApprove):**
```tsx
const handleApprove = async (upload: Upload) => {
  setActionLoading(true);

  let finalSubjectId = upload.subject_id;

  if (upload.suggested_subject_name && !upload.subject_id) {
    const { data: newSubject, error: subjectError } = await supabase
      .from('subjects')
      .insert({
        name: upload.suggested_subject_name,
        slug: subjectSlug,
        order_index: 0,
      })
      .select()
      .single();

    if (!subjectError && newSubject) {
      finalSubjectId = newSubject.id;
    }  // ← NO THROW - silently continues with NULL ID
  }

  if (!finalSubjectId) {
    setActionLoading(false);
    return;  // ← Returns but doesn't show error
  }

  const { error: lessonError } = await supabase.from('lessons').insert({
    title: upload.title,
    slug: slug,
    content: upload.content,
    subject_id: finalSubjectId,
    // ...
  });

  if (!lessonError) {  // ← Only updates upload if lesson succeeds
    await supabase
      .from('uploads')
      .update({ status: 'approved', ... })
      .eq('id', upload.id);
  }
  // ← If lessonError, upload is NEVER marked as approved
  // BUT subject was already created - ORPHANED
};
```

**Disaster Scenario:**
1. Admin approves upload with new subject "Quantum Physics"
2. Subject created successfully
3. Lesson insert fails (duplicate slug, auth error, etc)
4. Upload remains `pending`
5. Subject "Quantum Physics" is orphaned with no lessons
6. Next retry creates ANOTHER subject

### 🛠 Fix
Implement rollback and proper error handling:

```tsx
const handleApprove = async (upload: Upload) => {
  setActionLoading(true);

  let finalSubjectId = upload.subject_id;
  let newSubjectId: string | null = null;

  try {
    // Step 1: Create subject if needed
    if (upload.suggested_subject_name && !upload.subject_id) {
      const subjectSlug = slugify(upload.suggested_subject_name);
      const { data: newSubject, error: subjectError } = await supabase
        .from('subjects')
        .insert({
          name: upload.suggested_subject_name,
          slug: subjectSlug,
          order_index: 0,
        })
        .select()
        .single();

      if (subjectError) {
        throw new Error(`Failed to create subject: ${subjectError.message}`);
      }
      
      if (!newSubject) {
        throw new Error('Subject creation returned empty result');
      }

      finalSubjectId = newSubject.id;
      newSubjectId = newSubject.id;
    }

    if (!finalSubjectId) {
      throw new Error('No subject ID available for lesson');
    }

    // Step 2: Create lesson
    const slug = slugify(upload.title);
    const { error: lessonError } = await supabase.from('lessons').insert({
      title: upload.title,
      slug: slug,
      content: upload.content,
      subject_id: finalSubjectId,
      semester: upload.semester,
      pdf_url: upload.pdf_url,
      external_link: upload.external_link,
      author_id: upload.uploader_id,
      is_published: true,
      is_premium: false,
    });

    if (lessonError) {
      throw new Error(`Failed to create lesson: ${lessonError.message}`);
    }

    // Step 3: Mark upload as approved (only after both succeed)
    const { error: updateError } = await supabase
      .from('uploads')
      .update({
        status: 'approved',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes,
        subject_id: finalSubjectId,
      })
      .eq('id', upload.id);

    if (updateError) {
      throw new Error(`Failed to update upload: ${updateError.message}`);
    }

    // All succeeded - refresh data
    await fetchData();
    setSelectedUpload(null);
    setAdminNotes('');
    
  } catch (error) {
    console.error('Error approving upload:', error);
    
    // ROLLBACK: Delete orphaned subject if created
    if (newSubjectId) {
      await supabase
        .from('subjects')
        .delete()
        .eq('id', newSubjectId)
        .catch(err => console.error('Rollback failed:', err));
    }

    // Show error to user
    alert(`Failed to approve: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setActionLoading(false);
  }
};
```

### 🧪 How to Test
1. Create upload with new subject name
2. In database, make lesson insert fail (violate constraint)
3. Click Approve
4. Should see error alert
5. Verify subject was rolled back/deleted from DB

---

## 🧪 Summary of All Issues

| # | Bug | Severity | Fix Type |
|---|-----|----------|----------|
| 1 | Bookmark race condition | HIGH | Guard concurrent requests |
| 2 | View count duplicates | MEDIUM | Idempotent tracking |
| 3 | Null subject navigation | MEDIUM | Null check + fallback |
| 4 | Content overflow | LOW | CSS word-break |
| 5 | Auth memory leak | HIGH | isMounted check in fetchProfile |
| 6 | Orphaned subjects | MEDIUM | Transactional approval + rollback |

---

## 🚀 Recommended Prevention Patterns

1. **Race Condition Guard:**
```tsx
const [isLoading, setIsLoading] = useState(false);
const handleAction = async () => {
  if (isLoading) return;  // ← Simple but effective
  setIsLoading(true);
  try { /* ... */ }
  finally { setIsLoading(false); }
};
```

2. **Idempotency Check:**
```tsx
// Before mutations, check if change already exists
const existing = await db.check(id);
if (existing.status === 'already done') return;
// Only proceed if safe
```

3. **Unmount Guard:**
```tsx
useEffect(() => {
  let isMounted = true;
  
  async function load() {
    const data = await fetch();
    if (isMounted) setState(data);  // ← Always check
  }
  
  load();
  return () => { isMounted = false; };
}, []);
```

4. **Error Boundaries:**
```tsx
// Wrap async operations in try-catch with rollback
try {
  await step1();
  await step2();
  await step3();
} catch {
  // Undo step1 and step2
  rollback();
}
```

5. **Type Safety:**
```tsx
// Use Zod or TypeScript for runtime validation
const lesssonSchema = z.object({
  subject_id: z.string().uuid(),  // Prevents null
});
```
