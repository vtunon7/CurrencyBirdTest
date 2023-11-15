/*
  Warnings:

  - Added the required column `ip` to the `Payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payments" ADD COLUMN     "ip" TEXT NOT NULL;
