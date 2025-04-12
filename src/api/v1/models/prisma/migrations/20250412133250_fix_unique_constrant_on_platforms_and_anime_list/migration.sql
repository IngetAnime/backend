/*
  Warnings:

  - A unique constraint covering the columns `[user_id,anime_id]` on the table `anime_list` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[link]` on the table `platforms` will be added. If there are existing duplicate values, this will fail.
  - Made the column `episodes_difference` on table `anime_list` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "anime_list" ALTER COLUMN "episodes_difference" SET NOT NULL,
ALTER COLUMN "episodes_difference" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "anime_list_user_id_anime_id_key" ON "anime_list"("user_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_link_key" ON "platforms"("link");
