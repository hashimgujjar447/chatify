import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/verifyAuth";
export async function GET(req: Request) {
  try {
    const user = await verifyAuth();
    if (!user.userId) {
      return NextResponse.json({
        success: false,
        message: "Login first please",
      });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json({
        success: false,
        message: "Group id is required",
      });
    }

    const isGroupAvailable = await prisma.group.findFirst({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        groupDescription: true,
        groupImage: true,
        createdAt: true,
        createdBy: true,
      },
    });

    if (!isGroupAvailable) {
      return NextResponse.json({
        success: false,
        message: "No group of such id is available",
      });
    }

    const getAllGroupMembers = await prisma.groupMember.findMany({
      where: { groupId },
      select: {
        role: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        group: isGroupAvailable,
        members: getAllGroupMembers,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error while getting group members",
    });
  }
}
