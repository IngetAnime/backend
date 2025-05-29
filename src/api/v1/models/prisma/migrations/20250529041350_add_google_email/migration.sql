/*
  Warnings:

  - A unique constraint covering the columns `[google_email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "google_email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_google_email_key" ON "users"("google_email");
