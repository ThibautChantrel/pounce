-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'OTHER');

-- AlterTable: migrate name -> pseudo before dropping
ALTER TABLE "users" ADD COLUMN "pseudo" TEXT;
UPDATE "users" SET "pseudo" = name WHERE name IS NOT NULL AND name <> '';
ALTER TABLE "users" DROP COLUMN "name";
ALTER TABLE "users"
  ADD COLUMN "birthDate" TIMESTAMP(3),
  ADD COLUMN "firstName" TEXT,
  ADD COLUMN "gender" "Gender",
  ADD COLUMN "height" INTEGER,
  ADD COLUMN "isCertified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "lastName" TEXT,
  ADD COLUMN "nationality" TEXT,
  ADD COLUMN "stravaId" TEXT,
  ADD COLUMN "stravaToken" TEXT,
  ADD COLUMN "weight" DOUBLE PRECISION;

-- CreateIndex (unique after potential duplicates resolved)
CREATE UNIQUE INDEX "users_pseudo_key" ON "users"("pseudo");
CREATE UNIQUE INDEX "users_stravaId_key" ON "users"("stravaId");
