-- Add lastResyncAt to accounts (replaces User.stravaResyncAt)
ALTER TABLE "accounts" ADD COLUMN "lastResyncAt" TIMESTAMP(3);

-- Migrate stravaResyncAt from users to their strava account
UPDATE "accounts"
SET "lastResyncAt" = u."stravaResyncAt"
FROM "users" u
WHERE "accounts"."userId" = u."id"
  AND "accounts"."provider" = 'strava'
  AND u."stravaResyncAt" IS NOT NULL;

-- Remove strava-specific columns from users
ALTER TABLE "users" DROP COLUMN IF EXISTS "stravaId";
ALTER TABLE "users" DROP COLUMN IF EXISTS "stravaToken";
ALTER TABLE "users" DROP COLUMN IF EXISTS "stravaResyncAt";

-- Add provider column to track_certifications
ALTER TABLE "track_certifications" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'strava';

-- Rename stravaActivityId -> activityId in track_certifications
ALTER TABLE "track_certifications" RENAME COLUMN "stravaActivityId" TO "activityId";

-- Update unique constraint on track_certifications
ALTER TABLE "track_certifications" DROP CONSTRAINT IF EXISTS "track_certifications_stravaActivityId_trackId_key";
ALTER TABLE "track_certifications" ADD CONSTRAINT "track_certifications_provider_activityId_trackId_key" UNIQUE ("provider", "activityId", "trackId");

-- Rename strava_syncs -> activity_syncs and add provider column
ALTER TABLE "strava_syncs" RENAME TO "activity_syncs";
ALTER TABLE "activity_syncs" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'strava';
