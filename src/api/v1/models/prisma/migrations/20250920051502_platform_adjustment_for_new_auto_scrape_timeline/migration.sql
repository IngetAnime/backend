/*
  Warnings:

  - You are about to drop the `anime_schedules` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "anime_schedules" DROP CONSTRAINT "anime_schedules_anime_id_fkey";

-- AlterTable
ALTER TABLE "anime_platform" ALTER COLUMN "next_episode_airing_at" DROP NOT NULL;

-- DropTable
DROP TABLE "anime_schedules";
