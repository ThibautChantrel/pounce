/*
  Warnings:

  - The primary key for the `_PoiToTrack` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_PoiToTrack` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_PoiToTrack" DROP CONSTRAINT "_PoiToTrack_AB_pkey";

-- AlterTable
ALTER TABLE "tracks" ADD COLUMN     "elevationGain" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "_PoiToTrack_AB_unique" ON "_PoiToTrack"("A", "B");
