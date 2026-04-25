DROP INDEX IF EXISTS "challenge_certifications_userId_isRead_idx";
DROP INDEX IF EXISTS "track_certifications_stravaActivityId_trackId_key";
DROP INDEX IF EXISTS "track_certifications_userId_isRead_idx";

DO $$
BEGIN
  IF to_regclass('public.strava_syncs') IS NOT NULL
     AND to_regclass('public.activity_syncs') IS NULL THEN
    ALTER TABLE "strava_syncs" RENAME TO "activity_syncs";
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.activity_syncs') IS NOT NULL THEN
    ALTER TABLE "activity_syncs" ALTER COLUMN "provider" DROP DEFAULT;
  END IF;
END $$;
