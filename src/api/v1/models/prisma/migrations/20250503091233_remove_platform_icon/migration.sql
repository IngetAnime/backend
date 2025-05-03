/*
  Warnings:

  - You are about to drop the column `icon` on the `anime_platform` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `platforms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "anime_platform" DROP COLUMN "icon";

-- AlterTable
ALTER TABLE "platforms" DROP COLUMN "icon";
