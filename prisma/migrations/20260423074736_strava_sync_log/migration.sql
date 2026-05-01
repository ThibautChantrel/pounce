-- CreateTable
CREATE TABLE "strava_syncs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB NOT NULL,

    CONSTRAINT "strava_syncs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "strava_syncs" ADD CONSTRAINT "strava_syncs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
