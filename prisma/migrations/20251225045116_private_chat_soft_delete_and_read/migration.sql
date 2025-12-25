-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeletedByReceiver" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDeletedBySender" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDeletedForEveryone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Chat_senderId_isDeletedBySender_idx" ON "Chat"("senderId", "isDeletedBySender");

-- CreateIndex
CREATE INDEX "Chat_receiverId_isDeletedByReceiver_idx" ON "Chat"("receiverId", "isDeletedByReceiver");
