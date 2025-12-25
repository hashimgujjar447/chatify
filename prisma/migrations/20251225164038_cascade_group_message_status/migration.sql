-- DropForeignKey
ALTER TABLE "GroupMessageStatus" DROP CONSTRAINT "GroupMessageStatus_messageId_fkey";

-- AddForeignKey
ALTER TABLE "GroupMessageStatus" ADD CONSTRAINT "GroupMessageStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "GroupChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
