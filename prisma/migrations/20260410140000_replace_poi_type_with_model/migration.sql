-- CreateTable: poi_types (before altering pois)
CREATE TABLE "poi_types" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "poi_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "poi_types_value_key" ON "poi_types"("value");

-- Seed existing PoiType enum values
INSERT INTO "poi_types" ("id", "value", "description", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'METRO',     'Station de métro',    NOW(), NOW()),
  (gen_random_uuid()::text, 'MONUMENT',  'Monument historique',  NOW(), NOW()),
  (gen_random_uuid()::text, 'PARK',      'Parc ou jardin',       NOW(), NOW()),
  (gen_random_uuid()::text, 'RESTAURANT','Restaurant',           NOW(), NOW()),
  (gen_random_uuid()::text, 'VIEWPOINT', 'Point de vue',         NOW(), NOW()),
  (gen_random_uuid()::text, 'OTHER',     'Autre',                NOW(), NOW());

-- AlterTable: add typeId column (nullable)
ALTER TABLE "pois" ADD COLUMN "typeId" TEXT;

-- Migrate existing enum values to FK references
UPDATE "pois" p
SET "typeId" = pt.id
FROM "poi_types" pt
WHERE p.type::text = pt.value;

-- AlterTable: drop old enum column
ALTER TABLE "pois" DROP COLUMN "type";

-- DropEnum
DROP TYPE "PoiType";

-- AddForeignKey
ALTER TABLE "pois" ADD CONSTRAINT "pois_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "poi_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poi_types" ADD CONSTRAINT "poi_types_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poi_types" ADD CONSTRAINT "poi_types_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
