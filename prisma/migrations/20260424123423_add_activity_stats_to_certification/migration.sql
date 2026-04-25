-- AlterTable
ALTER TABLE "track_certifications" ADD COLUMN     "activityType" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "calories" INTEGER,
ADD COLUMN     "distance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "elevationGain" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "heartRateAvg" INTEGER,
ADD COLUMN     "heartRateMax" INTEGER,
ADD COLUMN     "maxSpeed" DOUBLE PRECISION;
