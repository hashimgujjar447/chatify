import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await verifyAuth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { groupMessageId, groupId } = await req.json();

    if (!groupMessageId || !groupId) {
      return NextResponse.json(
        { success: false, message: "groupMessageId and groupId are required" },
        { status: 400 },
      );
    }

    // Check group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, message: "Group not found" },
        { status: 404 },
      );
    }

    // Check membership
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "You are not a member of this group" },
        { status: 403 },
      );
    }

    // Check message ownership
    const message = await prisma.groupChat.findUnique({
      where: { id: groupMessageId },
    });

    if (!message || message.groupId !== groupId) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 },
      );
    }

    // OPTIONAL: allow only sender or admin
    if (message.senderId !== userId && member.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Not allowed to delete this message" },
        { status: 403 },
      );
    }

    await prisma.groupChat.update({
      where: { id: groupMessageId },
      data: { isDeletedForAll: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message deleted for everyone",
        messageId: groupMessageId,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
