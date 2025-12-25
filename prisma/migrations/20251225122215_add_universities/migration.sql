/*
  Warnings:

  - Added the required column `universityId` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable for University first
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- Insert default university for existing lessons
INSERT INTO "University" ("id", "name", "slug", "city", "createdAt", "updatedAt") 
VALUES ('default-uni', 'Other', 'other', 'Morocco', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
ON CONFLICT DO NOTHING;

-- AlterTable - add universityId with default
ALTER TABLE "Lesson" ADD COLUMN "universityId" TEXT NOT NULL DEFAULT 'default-uni';

-- CreateIndex
CREATE UNIQUE INDEX "University_name_key" ON "University"("name");

-- CreateIndex
CREATE UNIQUE INDEX "University_slug_key" ON "University"("slug");

-- CreateIndex
CREATE INDEX "University_slug_idx" ON "University"("slug");

-- CreateIndex
CREATE INDEX "University_city_idx" ON "University"("city");

-- CreateIndex
CREATE INDEX "Lesson_universityId_idx" ON "Lesson"("universityId");

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
