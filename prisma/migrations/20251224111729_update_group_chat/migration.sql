/*
  Warnings:

  - The `messageType` column on the `GroupChat` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'video', 'file');

-- AlterTable
ALTER TABLE "GroupChat" ALTER COLUMN "message" DROP NOT NULL,
DROP COLUMN "messageType",
ADD COLUMN     "messageType" "MessageType" NOT NULL DEFAULT 'text';
