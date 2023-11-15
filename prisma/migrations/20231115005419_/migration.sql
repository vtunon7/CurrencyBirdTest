/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payments_userId_key" ON "Payments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");
