-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "ListStatus" AS ENUM ('watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped');

-- CreateEnum
CREATE TYPE "AnimeStatus" AS ENUM ('currently_airing', 'finished_airing', 'not_yet_aired');

-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('limited_time', 'subscription', 'free');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "picture" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "otp_code" TEXT NOT NULL,
    "otp_expiration" TIMESTAMP(3) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "google_id" TEXT,
    "mal_id" TEXT,
    "mal_refresh_token" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anime_list" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "platform_id" INTEGER,
    "episodes_difference" INTEGER,
    "progress" INTEGER,
    "score" INTEGER,
    "start_date" TIMESTAMP(3),
    "finish_date" TIMESTAMP(3),
    "status" "ListStatus" NOT NULL DEFAULT 'plan_to_watch',
    "isSyncedWithMal" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anime_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anime" (
    "id" SERIAL NOT NULL,
    "platform_id" INTEGER,
    "mal_id" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "picture" TEXT NOT NULL,
    "episode_total" INTEGER NOT NULL DEFAULT 0,
    "is_hiatus" BOOLEAN NOT NULL DEFAULT false,
    "status" "AnimeStatus" NOT NULL DEFAULT 'not_yet_aired',

    CONSTRAINT "anime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" SERIAL NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "access_type" "AccessType" NOT NULL,
    "icon" TEXT,
    "release_at" TIMESTAMP(3),
    "episode_aired" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anime_schedules" (
    "id" SERIAL NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "update_on" TIMESTAMP(3) NOT NULL,
    "is_updated" BOOLEAN NOT NULL DEFAULT false,
    "status" "AnimeStatus" NOT NULL,

    CONSTRAINT "anime_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_schedules" (
    "id" SERIAL NOT NULL,
    "platform_id" INTEGER NOT NULL,
    "update_on" TIMESTAMP(3) NOT NULL,
    "is_updated" BOOLEAN NOT NULL DEFAULT false,
    "episodeNumber" INTEGER NOT NULL,

    CONSTRAINT "platform_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_mal_id_key" ON "users"("mal_id");

-- CreateIndex
CREATE UNIQUE INDEX "anime_mal_id_key" ON "anime"("mal_id");

-- AddForeignKey
ALTER TABLE "anime_list" ADD CONSTRAINT "anime_list_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_list" ADD CONSTRAINT "anime_list_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_list" ADD CONSTRAINT "anime_list_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime" ADD CONSTRAINT "anime_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platforms" ADD CONSTRAINT "platforms_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_schedules" ADD CONSTRAINT "anime_schedules_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_schedules" ADD CONSTRAINT "platform_schedules_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
