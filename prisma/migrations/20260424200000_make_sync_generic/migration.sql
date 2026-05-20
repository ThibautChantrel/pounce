-- Add lastResyncAt to accounts (replaces User.stravaResyncAt)
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "lastResyncAt" TIMESTAMP(3);

-- Migrate stravaResyncAt from users to their strava account
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stravaResyncAt') THEN
    UPDATE "accounts"
    SET "lastResyncAt" = u."stravaResyncAt"
    FROM "users" u
    WHERE "accounts"."userId" = u."id"
      AND "accounts"."provider" = 'strava'
      AND u."stravaResyncAt" IS NOT NULL;
  END IF;
END $$;

-- Remove strava-specific columns from users
ALTER TABLE "users" DROP COLUMN IF EXISTS "stravaId";
ALTER TABLE "users" DROP COLUMN IF EXISTS "stravaToken";
ALTER TABLE "users" DROP COLUMN IF EXISTS "stravaResyncAt";

-- Add provider column to track_certifications
ALTER TABLE "track_certifications" ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT 'strava';

-- Rename stravaActivityId -> activityId in track_certifications (if not already renamed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'track_certifications' AND column_name = 'stravaActivityId') THEN
    ALTER TABLE "track_certifications" RENAME COLUMN "stravaActivityId" TO "activityId";
  END IF;
END $$;

-- Update unique constraint on track_certifications
ALTER TABLE "track_certifications" DROP CONSTRAINT IF EXISTS "track_certifications_stravaActivityId_trackId_key";
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'track_certifications_provider_activityId_trackId_key'
  ) THEN
    ALTER TABLE "track_certifications" ADD CONSTRAINT "track_certifications_provider_activityId_trackId_key" UNIQUE ("provider", "activityId", "trackId");
  END IF;
END $$;

-- Rename strava_syncs -> activity_syncs (if not already renamed)
DO $$
BEGIN
  IF to_regclass('public.strava_syncs') IS NOT NULL THEN
    ALTER TABLE "strava_syncs" RENAME TO "activity_syncs";
  END IF;
END $$;

-- Add provider column to activity_syncs
ALTER TABLE "activity_syncs" ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT 'strava';
