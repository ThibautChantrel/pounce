ALTER TABLE "track_certifications"
ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "challenge_certifications"
ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "track_certifications_userId_isRead_idx"
ON "track_certifications" ("userId", "isRead");

CREATE INDEX "challenge_certifications_userId_isRead_idx"
ON "challenge_certifications" ("userId", "isRead");
