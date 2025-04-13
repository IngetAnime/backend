/*
  Warnings:

  - A unique constraint covering the columns `[anime_id,status]` on the table `anime_schedules` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[platform_id,episodeNumber]` on the table `platform_schedules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "anime_schedules_anime_id_status_key" ON "anime_schedules"("anime_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "platform_schedules_platform_id_episodeNumber_key" ON "platform_schedules"("platform_id", "episodeNumber");
