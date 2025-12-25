import { verifyAuth } from "@/lib/verifyAuth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authUser = await verifyAuth();
    if (!authUser.userId) {
      return NextResponse.json({
        success: false,
        message: "Please login first",
      });
    }

    const { messageId } = await req.json();
    if (!messageId) {
      return NextResponse.json({
        success: false,
        message: "Message ID is required",
      });
    }

    const message = await prisma.chat.findFirst({
      where: {
        chatId: messageId,
        senderId: authUser.userId,
        isDeletedForEveryone: false,
      },
    });

    if (!message) {
      return NextResponse.json({
        success: false,
        message: "No such message found or already deleted",
      });
    }

    const now = new Date();
    const messageTime = message.createdAt;
    if (now.getTime() - messageTime.getTime() > 2 * 60 * 1000) {
      return NextResponse.json({
        success: false,
        message: "You can only delete messages within 2 minutes",
      });
    }
    const updatedData = await prisma.chat.update({
      where: { chatId: messageId },
      data: { isDeletedForEveryone: true, deletedAt: now },
    });

    return NextResponse.json({
      success: true,
      message: "Message deleted from everyone  successfully",
      data: updatedData,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
