# Neon DB + NextAuth.js Migration Guide

**Date:** December 25, 2025  
**Status:** Follow these steps in order

---

## 📋 Prerequisites

You need:
1. Neon DB account (https://neon.tech) - FREE tier available
2. Your Neon connection string (DATABASE_URL)
3. Node.js 18+ installed

---

## 🚀 Step 1: Create Neon Database

1. Go to https://console.neon.tech
2. Create new project
3. Copy your connection string: `postgresql://user:password@host/dbname`
4. Save it - you'll need it in Step 2

---

## 📦 Step 2: Install Dependencies

Run this command:

```bash
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client bcryptjs
npm install -D prisma
```

**Why these packages?**
- `next-auth`: Authentication framework
- `@auth/prisma-adapter`: Database adapter for NextAuth with Prisma ORM
- `prisma`: ORM for type-safe database access
- `bcryptjs`: Password hashing
- `postgres` or `pg`: Database driver (already included with Prisma)

---

## 🔑 Step 3: Setup Environment Variables

Create `.env.local` file:

```env
# Neon Database
DATABASE_URL="postgresql://user:password@neon-host/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
```

**For production:**
- Set `NEXTAUTH_URL` to your domain
- Generate strong secret: `openssl rand -base64 32`

---

## 🗄️ Step 4: Setup Prisma

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  password      String?
  image         String?
  role          String    @default("student") // student, teacher, admin
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
  bookmarks Bookmark[]
  uploads   Upload[]
  lessons   Lesson[]
  resources Resource[]
}

model Subject {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  icon        String?
  orderIndex  Int      @default(0)
  createdAt   DateTime @default(now())

  lessons   Lesson[]
  modules   Module[]
  resources Resource[]
}

model Lesson {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String?
  subjectId   String
  semester    String?
  pdfUrl      String?
  externalLink String?
  authorId    String
  views       Int      @default(0)
  isPublished Boolean  @default(false)
  isPremium   Boolean  @default(false)
  orderIndex  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subject   Subject   @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  author    User      @relation(fields: [authorId], references: [id], onDelete: SetNull)
  tags      Tag[]
  bookmarks Bookmark[]

  @@index([subjectId])
  @@index([authorId])
  @@index([isPublished])
}

model Tag {
  id   String @id @default(cuid())
  name String @unique
  slug String @unique

  lessons Lesson[]
}

model Bookmark {
  id        String   @id @default(cuid())
  userId    String
  lessonId  String
  createdAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId])
}

model Upload {
  id                String   @id @default(cuid())
  title             String
  content           String?
  subjectId         String?
  semester          String?
  pdfUrl            String?
  externalLink      String?
  tags              String[]
  uploaderId        String
  status            String   @default("pending") // pending, approved, rejected
  adminNotes        String?
  reviewedBy        String?
  reviewedAt        DateTime?
  createdAt         DateTime @default(now())

  uploader User? @relation(fields: [uploaderId], references: [id], onDelete: SetNull)

  @@index([status])
  @@index([uploaderId])
}

model Module {
  id          String   @id @default(cuid())
  subjectId   String
  name        String
  slug        String
  description String?
  orderIndex  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subject   Subject    @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  resources Resource[]

  @@unique([subjectId, slug])
  @@index([subjectId])
}

model Resource {
  id            String   @id @default(cuid())
  moduleId      String
  subjectId     String
  title         String
  slug          String
  description   String?
  resourceType  String   @default("lesson") // lesson, pdf, book, link, document
  content       String?
  pdfUrl        String?
  externalLink  String?
  authorId      String
  isPublished   Boolean  @default(false)
  isPremium     Boolean  @default(false)
  orderIndex    Int      @default(0)
  views         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  module Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  subject Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  author  User   @relation(fields: [authorId], references: [id], onDelete: SetNull)
  tags    Tag[]

  @@unique([moduleId, slug])
  @@index([moduleId])
  @@index([subjectId])
}
```

---

## ▶️ Step 5: Run Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate dev --name init

# Open Prisma Studio (optional, to view data)
npx prisma studio
```

---

## ✅ Done!

Continue to the next configuration files...
