import { verifyAuth } from "@/lib/verifyAuth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const user = await verifyAuth();

    if (!user?.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const groups = await prisma.groupMember.findMany({
      where: {
        userId: user.userId,
      },
      select: {
        id: true,
        role: true,
        group: {
          select: {
            id: true,
            name: true,
            groupDescription: true,
            groupImage: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: groups.length
        ? "Groups fetched successfully"
        : "No groups found",
      data: groups,
    });
  } catch (error) {
    console.error("FETCH GROUP ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}
