/*
  Warnings:

  - Made the column `next_episode_airing_at` on table `platforms` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "anime" ADD COLUMN     "release_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "platforms" ALTER COLUMN "next_episode_airing_at" SET NOT NULL;
