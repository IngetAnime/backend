/*
  Warnings:

  - You are about to drop the column `platform_id` on the `anime` table. All the data in the column will be lost.
  - You are about to drop the column `platform_id` on the `anime_list` table. All the data in the column will be lost.
  - You are about to drop the column `access_type` on the `platforms` table. All the data in the column will be lost.
  - You are about to drop the column `anime_id` on the `platforms` table. All the data in the column will be lost.
  - You are about to drop the column `episode_aired` on the `platforms` table. All the data in the column will be lost.
  - You are about to drop the column `last_episode_aired_at` on the `platforms` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `platforms` table. All the data in the column will be lost.
  - You are about to drop the column `next_episode_airing_at` on the `platforms` table. All the data in the column will be lost.
  - You are about to drop the `platform_schedules` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `icon` on table `platforms` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "anime" DROP CONSTRAINT "anime_platform_id_fkey";

-- DropForeignKey
ALTER TABLE "anime_list" DROP CONSTRAINT "anime_list_platform_id_fkey";

-- DropForeignKey
ALTER TABLE "platform_schedules" DROP CONSTRAINT "platform_schedules_platform_id_fkey";

-- DropForeignKey
ALTER TABLE "platforms" DROP CONSTRAINT "platforms_anime_id_fkey";

-- DropIndex
DROP INDEX "platforms_link_key";

-- AlterTable
ALTER TABLE "anime" DROP COLUMN "platform_id";

-- AlterTable
ALTER TABLE "anime_list" DROP COLUMN "platform_id",
ADD COLUMN     "anime_platform_id" INTEGER;

-- AlterTable
ALTER TABLE "platforms" DROP COLUMN "access_type",
DROP COLUMN "anime_id",
DROP COLUMN "episode_aired",
DROP COLUMN "last_episode_aired_at",
DROP COLUMN "link",
DROP COLUMN "next_episode_airing_at",
ALTER COLUMN "icon" SET NOT NULL;

-- DropTable
DROP TABLE "platform_schedules";

-- CreateTable
CREATE TABLE "anime_platform" (
    "id" SERIAL NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "anime_platform_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "link" TEXT NOT NULL,
    "access_type" "AccessType" NOT NULL,
    "next_episode_airing_at" TIMESTAMP(3) NOT NULL,
    "last_episode_aired_at" TIMESTAMP(3),
    "interval_in_days" INTEGER NOT NULL DEFAULT 7,
    "episode_aired" INTEGER NOT NULL DEFAULT 0,
    "is_main_platform" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "anime_platform_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "anime_platform_link_key" ON "anime_platform"("link");

-- CreateIndex
CREATE UNIQUE INDEX "anime_platform_anime_platform_id_anime_id_key" ON "anime_platform"("anime_platform_id", "anime_id");

-- AddForeignKey
ALTER TABLE "anime_list" ADD CONSTRAINT "anime_list_anime_platform_id_fkey" FOREIGN KEY ("anime_platform_id") REFERENCES "anime_platform"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_platform" ADD CONSTRAINT "anime_platform_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_platform" ADD CONSTRAINT "anime_platform_anime_platform_id_fkey" FOREIGN KEY ("anime_platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
