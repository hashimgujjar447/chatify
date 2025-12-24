import { verifyAuth } from "@/lib/verifyAuth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authUser = await verifyAuth();

    if (!authUser?.userId) {
      return NextResponse.json({
        success: false,
        message: "Please login first",
      });
    }

    const { groupId, userId: targetUserId } = await req.json();

    if (!groupId || !targetUserId) {
      return NextResponse.json({
        success: false,
        message: "groupId and userId are required",
      });
    }

    // 1️⃣ Check if logged-in user is admin
    const currentAdmin = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: authUser.userId,
        },
      },
    });

    if (!currentAdmin) {
      return NextResponse.json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    if (currentAdmin.role !== "admin") {
      return NextResponse.json({
        success: false,
        message: "Only admins can remove members",
      });
    }

    // 2️⃣ Prevent self-removal
    if (authUser.userId === targetUserId) {
      return NextResponse.json({
        success: false,
        message: "You cannot remove yourself. Use 'Leave Group' instead.",
      });
    }

    // 3️⃣ Check if target member exists
    const targetMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json({
        success: false,
        message: "Target user is not in this group",
      });
    }

    // 4️⃣ Remove the member
    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("REMOVE_MEMBER_ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Something went wrong while removing member",
    });
  }
}
