-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "messageType" "MessageType" NOT NULL DEFAULT 'text';
