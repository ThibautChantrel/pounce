-- AlterTable
ALTER TABLE "poi_types" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stravaResyncAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "challenge_certifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_certifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "stravaActivityId" TEXT NOT NULL,
    "avgSpeed" DOUBLE PRECISION NOT NULL,
    "totalTime" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "challenge_certifications_userId_challengeId_key" ON "challenge_certifications"("userId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "track_certifications_stravaActivityId_trackId_key" ON "track_certifications"("stravaActivityId", "trackId");

-- AddForeignKey
ALTER TABLE "challenge_certifications" ADD CONSTRAINT "challenge_certifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_certifications" ADD CONSTRAINT "challenge_certifications_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_certifications" ADD CONSTRAINT "track_certifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_certifications" ADD CONSTRAINT "track_certifications_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
