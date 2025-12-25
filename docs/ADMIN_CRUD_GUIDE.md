# Admin Dashboard & CRUD Operations

## Overview
Complete admin control panel has been implemented with full CRUD operations for managing users, moderators, lessons, and uploads.

## Features Implemented

### 1. **Admin Authentication & Authorization**
- All admin routes check for admin role via `checkAdmin()` function
- Uses NextAuth JWT tokens to verify admin status
- Role-based access control prevents non-admin access (401 Unauthorized)
- Users cannot modify their own admin role or delete themselves

### 2. **User Management**
**API Endpoint: `/api/admin/users`**

#### GET (List Users)
- Paginated user list with pagination metadata
- Filter by role: `?role=student|teacher|moderator|admin`
- Search by name or email: `?search=john`
- Pagination support: `?page=1&limit=10`
- Returns: user email, name, role, join date, upload count, bookmark count

#### POST (Create User)
- Create new users with email, name, and role
- Validate required fields
- Check for duplicate emails
- Returns: created user data

#### PATCH (Update User)
**Endpoint: `/api/admin/users/[id]`**
- Update user name, role, or profile image
- Prevent self-demotion from admin role
- Validate role values
- Returns: updated user data

#### DELETE (Delete User)
**Endpoint: `/api/admin/users/[id]`**
- Delete user and cascade delete related data
- Prevent self-deletion
- Returns: success message

### 3. **Moderator Management**
**API Endpoint: `/api/admin/moderators`**

#### GET (List Moderators)
- Returns list of all users with moderator role
- Shows join date and upload count

#### POST (Create/Promote Moderator)
- Promote existing user to moderator: `{ userId: "..." }`
- Create new moderator account: `{ email: "...", name: "..." }`
- Returns: moderator data

#### DELETE (Remove Moderator)
**Endpoint: `/api/admin/moderators/[id]`**
- Demote moderator back to student role
- Returns: updated user with new role

### 4. **Lesson Management**
**API Endpoint: `/api/admin/lessons`**

#### GET (List Lessons)
- Paginated lesson list with pagination support
- Filter by published status: `?published=true|false`
- Search by title or description: `?search=...`
- Sort options: `?sort=newest|oldest|views`
- Returns: lesson title, slug, description, author, subject, difficulty, views, published status

#### PATCH (Update Lesson)
**Endpoint: `/api/admin/lessons/[id]`**
- Update: title, description, content, difficulty, published status
- Toggle publish/unpublish
- Returns: updated lesson data

#### DELETE (Delete Lesson)
**Endpoint: `/api/admin/lessons/[id]`**
- Delete lesson permanently
- Returns: success message

### 5. **Upload Moderation & Content Control**
**API Endpoint: `/api/admin/uploads`**

#### GET (List Uploads)
- Filter by status: `?status=pending|approved|rejected`
- Paginated results
- Returns: upload title, description, user info, lesson subject, status, reason (if applicable)

#### PATCH (Approve/Reject Upload)
**Endpoint: `/api/admin/uploads/[id]`**
- Approve upload: `{ status: "approved", reason: "optional feedback" }`
- Reject upload: `{ status: "rejected", reason: "rejection reason" }`
- Only pending uploads can be moderated
- Returns: updated upload with status and reason

#### DELETE (Delete Upload)
**Endpoint: `/api/admin/uploads/[id]`**
- Delete upload record
- Returns: success message

## Admin Dashboard UI Components

### Statistics Cards (Top 4)
- **Total Users** - Count of all platform users
- **Total Lessons** - Count of published lessons
- **Subjects** - Number of topics/subjects
- **Pending** - Count of uploads awaiting review

### Tabs (4 Main Sections)

#### 1. **Content Moderation** Tab
- Filter uploads by status: Pending, Approved, Rejected
- For each pending upload:
  - View title, description, submitter
  - Click "Approve" to accept and create lesson
  - Click "Reject" to decline
  - Optional feedback/reason input
- View approved/rejected uploads with reasons
- Non-pending uploads are read-only

#### 2. **Lessons** Tab
- Search lessons by title/description
- Filter by status: All, Published, Draft
- For each lesson:
  - View metadata (views, difficulty, subject)
  - Toggle Publish/Unpublish button
  - Delete button with confirmation
- Bulk operations supported

#### 3. **Users** Tab
- Create new user form:
  - Input: email, name, role (Student/Teacher/Moderator)
  - Validate before submission
- Search/filter users:
  - Search by name or email
  - Filter by role
- For each user:
  - View email, role, join date
  - View upload/bookmark counts
  - Edit button to modify name/role
  - Delete button with confirmation
- Edit form with role selector

#### 4. **Moderators** Tab
- "Add Moderator" button
- Create form:
  - Email and name fields
  - Promotes existing user or creates new account
- For each moderator:
  - View name, email, join date
  - "Remove Role" button to demote to student

## Security Features

1. **Admin-Only Routes**: All `/api/admin/*` endpoints require admin role
2. **Self-Protection**: Admins cannot demote or delete themselves
3. **Role Validation**: Only valid roles accepted (student, teacher, moderator, admin)
4. **Confirmation Dialogs**: Destructive actions require user confirmation
5. **Error Handling**: Proper HTTP status codes (401, 403, 404, 400, 409)
6. **Unique Constraints**: Email uniqueness enforced on user creation

## API Response Format

### Success Response
```json
{
  "users": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Error Response
```json
{
  "error": "Unauthorized - Admin only"
}
```

## Role Hierarchy
- **Admin**: Full access to all operations
- **Moderator**: Can moderate content/uploads (implement separately)
- **Teacher**: Can create lessons/content
- **Student**: Can view, bookmark, and upload

## Testing the Admin Features

### 1. Test User Management
```bash
# List users
curl http://localhost:3000/api/admin/users

# Create user
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","role":"student"}'

# Update user role
curl -X PATCH http://localhost:3000/api/admin/users/[userId] \
  -H "Content-Type: application/json" \
  -d '{"role":"moderator"}'

# Delete user
curl -X DELETE http://localhost:3000/api/admin/users/[userId]
```

### 2. Test Moderator Management
```bash
# Add moderator
curl -X POST http://localhost:3000/api/admin/moderators \
  -H "Content-Type: application/json" \
  -d '{"email":"mod@example.com","name":"Moderator"}'

# Remove moderator
curl -X DELETE http://localhost:3000/api/admin/moderators/[userId]
```

### 3. Test Lesson Management
```bash
# List lessons
curl http://localhost:3000/api/admin/lessons?published=true

# Update lesson
curl -X PATCH http://localhost:3000/api/admin/lessons/[lessonId] \
  -H "Content-Type: application/json" \
  -d '{"published":false}'

# Delete lesson
curl -X DELETE http://localhost:3000/api/admin/lessons/[lessonId]
```

### 4. Test Upload Moderation
```bash
# List pending uploads
curl http://localhost:3000/api/admin/uploads?status=pending

# Approve upload
curl -X PATCH http://localhost:3000/api/admin/uploads/[uploadId] \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","reason":"Looks good!"}'

# Reject upload
curl -X PATCH http://localhost:3000/api/admin/uploads/[uploadId] \
  -H "Content-Type: application/json" \
  -d '{"status":"rejected","reason":"Needs improvement"}'
```

## Files Created/Modified

### New API Routes
- `/app/api/admin/users/route.ts` - User CRUD
- `/app/api/admin/users/[id]/route.ts` - User detail operations
- `/app/api/admin/moderators/route.ts` - Moderator CRUD
- `/app/api/admin/moderators/[id]/route.ts` - Moderator detail
- `/app/api/admin/lessons/route.ts` - Lesson list & filtering
- `/app/api/admin/lessons/[id]/route.ts` - Lesson detail operations
- `/app/api/admin/uploads/route.ts` - Upload moderation list
- `/app/api/admin/uploads/[id]/route.ts` - Upload approval/rejection

### Updated Pages
- `/app/admin/page.tsx` - Complete admin dashboard redesign with all CRUD operations

## Future Enhancements
- [ ] Bulk user operations (export, delete multiple)
- [ ] Lesson analytics dashboard
- [ ] Advanced moderation filters
- [ ] Audit logs for all admin actions
- [ ] Email notifications for moderators
- [ ] Custom user roles/permissions
- [ ] Content analytics and reporting

