-- CreateEnum
CREATE TYPE "RaceFormat" AS ENUM ('ONE_SHOT', 'BACKYARD');

-- CreateEnum
CREATE TYPE "RaceAccessType" AS ENUM ('PUBLIC_FREE', 'PUBLIC_VALIDATION', 'PRIVATE');

-- CreateEnum
CREATE TYPE "RaceStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'REGISTERED', 'VALIDATED', 'DNF', 'DNS', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "LoopStatus" AS ENUM ('PENDING', 'VALIDATED', 'MISSED');

-- CreateEnum
CREATE TYPE "ValidationSource" AS ENUM ('AUTO', 'ORGANIZER');

-- CreateTable
CREATE TABLE "races" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "activityMode" "ActivityMode" NOT NULL,
    "logoId" TEXT,
    "bannerId" TEXT,
    "trackId" TEXT NOT NULL,
    "format" "RaceFormat" NOT NULL,
    "accessType" "RaceAccessType" NOT NULL,
    "accessCode" TEXT,
    "maxParticipants" INTEGER,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "loopDurationMinutes" INTEGER,
    "status" "RaceStatus" NOT NULL DEFAULT 'DRAFT',
    "organizerId" TEXT NOT NULL,
    "adminValidatedAt" TIMESTAMP(3),
    "adminValidatedById" TEXT,
    "adminRejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "races_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "race_registrations" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "statusReason" TEXT,
    "statusUpdatedBy" TEXT,
    "totalTimeSeconds" INTEGER,
    "rank" INTEGER,
    "stravaActivityId" TEXT,
    "validationSource" "ValidationSource",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "race_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backyard_loops" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "loopNumber" INTEGER NOT NULL,
    "stravaActivityId" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "timeSeconds" INTEGER,
    "avgSpeed" DOUBLE PRECISION,
    "status" "LoopStatus" NOT NULL DEFAULT 'PENDING',
    "validationSource" "ValidationSource",
    "validatedAt" TIMESTAMP(3),
    "validatedById" TEXT,

    CONSTRAINT "backyard_loops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "race_registrations_raceId_userId_key" ON "race_registrations"("raceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "backyard_loops_registrationId_loopNumber_key" ON "backyard_loops"("registrationId", "loopNumber");

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_adminValidatedById_fkey" FOREIGN KEY ("adminValidatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_registrations" ADD CONSTRAINT "race_registrations_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "races"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_registrations" ADD CONSTRAINT "race_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backyard_loops" ADD CONSTRAINT "backyard_loops_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "race_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
