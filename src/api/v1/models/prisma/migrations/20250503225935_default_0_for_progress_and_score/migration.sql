/*
  Warnings:

  - Made the column `progress` on table `anime_list` required. This step will fail if there are existing NULL values in that column.
  - Made the column `score` on table `anime_list` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "anime_list" ALTER COLUMN "progress" SET NOT NULL,
ALTER COLUMN "progress" SET DEFAULT 0,
ALTER COLUMN "score" SET NOT NULL,
ALTER COLUMN "score" SET DEFAULT 0;
