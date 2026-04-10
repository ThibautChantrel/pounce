-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_categories" (
    "trackId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "track_categories_pkey" PRIMARY KEY ("trackId","categoryId")
);

-- CreateTable
CREATE TABLE "challenge_categories" (
    "challengeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "challenge_categories_pkey" PRIMARY KEY ("challengeId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_value_key" ON "categories"("value");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_categories" ADD CONSTRAINT "track_categories_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_categories" ADD CONSTRAINT "track_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_categories" ADD CONSTRAINT "challenge_categories_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_categories" ADD CONSTRAINT "challenge_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
