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

    const { userId, groupId } = await req.json();

    if (!userId || !groupId) {
      return NextResponse.json({
        success: false,
        message: "userId and groupId are required",
      });
    }

    // 1️⃣ Check group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({
        success: false,
        message: "Group does not exist",
      });
    }

    // 2️⃣ Check logged-in user role
    const adminCheck = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: authUser.userId,
        },
      },
    });

    if (!adminCheck) {
      return NextResponse.json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    if (adminCheck.role !== "admin") {
      return NextResponse.json({
        success: false,
        message: "Only admin can promote members",
      });
    }

    // 3️⃣ Check target user exists in group
    const targetMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json({
        success: false,
        message: "Target user is not in the group",
      });
    }

    // 4️⃣ Prevent re-promoting
    if (targetMember.role === "admin") {
      return NextResponse.json({
        success: false,
        message: "User is already an admin",
      });
    }

    // 5️⃣ Update role
    const updatedMember = await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      data: {
        role: "admin",
      },
    });

    return NextResponse.json({
      success: true,
      message: "User promoted to admin",
      data: updatedMember,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Something went wrong",
    });
  }
}
