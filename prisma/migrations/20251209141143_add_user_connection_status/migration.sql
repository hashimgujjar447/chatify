-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "UserConnections" ADD COLUMN     "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING';
