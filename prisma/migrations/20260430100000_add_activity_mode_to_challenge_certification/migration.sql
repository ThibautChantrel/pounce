-- CreateEnum
CREATE TYPE "ActivityMode" AS ENUM ('RUN', 'RIDE', 'HYBRID', 'OTHER');

-- AlterTable
ALTER TABLE "challenge_certifications" ADD COLUMN "activityMode" "ActivityMode" NOT NULL DEFAULT 'OTHER';
