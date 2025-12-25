-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "authorId" TEXT;

-- CreateIndex
CREATE INDEX "Lesson_authorId_idx" ON "Lesson"("authorId");

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
