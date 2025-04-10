/*
  Warnings:

  - A unique constraint covering the columns `[mal_access_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mal_refresh_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "mal_access_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_mal_access_token_key" ON "users"("mal_access_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_mal_refresh_token_key" ON "users"("mal_refresh_token");
