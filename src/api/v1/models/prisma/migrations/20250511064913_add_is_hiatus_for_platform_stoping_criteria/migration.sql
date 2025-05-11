/*
  Warnings:

  - You are about to drop the column `is_hiatus` on the `anime` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "anime" DROP COLUMN "is_hiatus";

-- AlterTable
ALTER TABLE "anime_platform" ADD COLUMN     "is_hiatus" BOOLEAN NOT NULL DEFAULT false;
