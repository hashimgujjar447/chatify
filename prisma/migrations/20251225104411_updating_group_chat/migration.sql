-- AlterTable
ALTER TABLE "GroupChat" ADD COLUMN     "isDeletedForAll" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "GroupMessageStatus" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isSeen" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GroupMessageStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupMessageStatus_messageId_userId_key" ON "GroupMessageStatus"("messageId", "userId");

-- AddForeignKey
ALTER TABLE "GroupMessageStatus" ADD CONSTRAINT "GroupMessageStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "GroupChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMessageStatus" ADD CONSTRAINT "GroupMessageStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
