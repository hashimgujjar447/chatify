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
    const { groupId, messageId } = await req.json();
    if (!groupId || !messageId) {
      return NextResponse.json({
        success: false,
        message: "Group id and message id is required",
      });
    }
    const isMember = await prisma.groupMember.findFirst({
      where: { groupId, userId: authUser.userId },
    });
    if (!isMember) {
      return NextResponse.json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const isGroupAvailable = await prisma.group.findFirst({
      where: {
        id: groupId,
      },
    });

    if (!isGroupAvailable) {
      return NextResponse.json({
        success: false,
        message: "No group is found please enter a valid group id ",
      });
    }

    const isChatavailable = await prisma.groupChat.findFirst({
      where: {
        AND: [{ id: messageId }, { groupId: groupId }],
      },
    });

    if (!isChatavailable) {
      return NextResponse.json({
        success: false,
        message: "No such chat found",
      });
    }

    const updateGroupMessageStatus = await prisma.groupMessageStatus.update({
      where: { messageId_userId: { messageId, userId: authUser.userId } },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    if (!updateGroupMessageStatus) {
      return NextResponse.json({
        success: false,
        message: "Failed to delete message",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Message delete updated",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Internel server error please try again",
    });
  }
}
