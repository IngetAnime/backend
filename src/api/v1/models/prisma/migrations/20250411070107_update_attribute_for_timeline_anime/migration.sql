/*
  Warnings:

  - You are about to drop the column `release_at` on the `platforms` table. All the data in the column will be lost.
  - Added the required column `next_episode_airing_at` to the `platforms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "platforms"
RENAME COLUMN "release_at" TO "next_episode_airing_at";

-- AlterTable
ALTER TABLE "platforms"
ADD COLUMN "last_episode_aired_at" TIMESTAMP(3);