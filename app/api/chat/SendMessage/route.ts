import { ApiError } from "@/lib/ApiError";
import { verifyAuth } from "@/lib/verifyAuth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Verify logged-in user
    const user = await verifyAuth();

    if (!user || typeof user === "string" || !user.userId) {
      return NextResponse.json({
        success: false,
        message: "Please login first to send a message",
      });
    }

    // Body data
    const { receiverId, message, attachmentUrl, messageType } =
      await req.json();

    if (!receiverId || (!message && !attachmentUrl)) {
      throw new ApiError(
        "Receiver ID and message/attachment are required",
        400
      );
    }

    // Validate messageType
    const validTypes = ["text", "image", "file", "video"];
    const finalMessageType = validTypes.includes(messageType)
      ? messageType
      : "text";

    // Create chat message
    const chat = await prisma.chat.create({
      data: {
        senderId: user.userId,
        receiverId: receiverId,
        message: message || "",
        attachmentUrl: attachmentUrl || null,
        messageType: finalMessageType,
      },
    });

    if (!chat) {
      throw new ApiError("Failed to send message", 500);
    }

    return NextResponse.json({ success: true, chat });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
