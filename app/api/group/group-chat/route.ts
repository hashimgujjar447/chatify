import { ApiError } from "@/lib/ApiError";
import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth();
    if (!user) {
      throw new ApiError("Please login first", 401);
    }

    const { groupId, message, messageType, chatImage } = await request.json();

    if (!groupId) {
      throw new ApiError("Group ID is required", 400);
    }
    if ((!message || message.trim() === "") && !chatImage) {
      throw new ApiError("Message or image is required", 400);
    }

    // Validate messageType
    const validTypes = ["text", "image", "file", "video"];
    const finalMessageType =
      messageType && validTypes.includes(messageType) ? messageType : "text";

    // Verify group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new ApiError("Group not found", 404);
    }

    // Verify user is a member of the group
    const isMember = await prisma.groupMember.findFirst({
      where: {
        groupId: groupId,
        userId: user.userId,
      },
    });

    if (!isMember) {
      throw new ApiError("You are not a member of this group", 403);
    }

    // Create group chat message
    const groupChat = await prisma.groupChat.create({
      data: {
        groupId: groupId,
        senderId: user.userId,
        message: message ? message.trim() : "",
        messageType: finalMessageType,
        attachmentUrl: chatImage || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: groupChat,
    });
  } catch (error) {
    console.error("Group chat error:", error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
