-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_createdById_fkey";

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
