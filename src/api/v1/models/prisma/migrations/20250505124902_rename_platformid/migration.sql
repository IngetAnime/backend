/*
  Warnings:

  - You are about to drop the column `anime_platform_id` on the `anime_platform` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[platform_id,anime_id]` on the table `anime_platform` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `platform_id` to the `anime_platform` table without a default value. This is not possible if the table is not empty.

*/
-- Rename column only
ALTER TABLE "anime_platform" RENAME COLUMN "anime_platform_id" TO "platform_id";

-- Rename index
DROP INDEX "anime_platform_anime_platform_id_anime_id_key";
CREATE UNIQUE INDEX "anime_platform_platform_id_anime_id_key" ON "anime_platform"("platform_id", "anime_id");

-- Rename foreign key constraint
ALTER TABLE "anime_platform" DROP CONSTRAINT "anime_platform_anime_platform_id_fkey";
ALTER TABLE "anime_platform" ADD CONSTRAINT "anime_platform_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
