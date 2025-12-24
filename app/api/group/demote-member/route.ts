import { verifyAuth } from "@/lib/verifyAuth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authUser = await verifyAuth();

    // 1️⃣ Auth check
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

    // 2️⃣ Get logged-in user membership
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
        message: "Only admins can demote members",
      });
    }

    // 3️⃣ Prevent self-demotion
    if (authUser.userId === targetUserId) {
      return NextResponse.json({
        success: false,
        message: "You cannot demote yourself",
      });
    }

    // 4️⃣ Get target member
    const targetAdmin = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
    });

    if (!targetAdmin) {
      return NextResponse.json({
        success: false,
        message: "Target user is not in this group",
      });
    }

    if (targetAdmin.role !== "admin") {
      return NextResponse.json({
        success: false,
        message: "Target user is not an admin",
      });
    }

    // 5️⃣ Seniority check (OLD admin protection)
    if (currentAdmin.joinedAt > targetAdmin.joinedAt) {
      return NextResponse.json({
        success: false,
        message: "You cannot demote an older admin",
      });
    }

    // 6️⃣ Ensure at least one admin remains
    const adminCount = await prisma.groupMember.count({
      where: {
        groupId,
        role: "admin",
      },
    });

    if (adminCount <= 1) {
      return NextResponse.json({
        success: false,
        message: "Group must have at least one admin",
      });
    }

    // 7️⃣ Demote
    const demotedMember = await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
      data: {
        role: "member",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin demoted successfully",
      data: demotedMember,
    });
  } catch (error) {
    console.error("DEMOTE_ADMIN_ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Something went wrong while demoting admin",
    });
  }
}
