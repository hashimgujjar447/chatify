import { ApiError } from "@/lib/ApiError";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth();
    if (!user || !user.userId) {
      return NextResponse.json({
        message: "Please login first",
        success: false,
      });
    }
    const { groupId } = await req.json();
    if (!groupId) {
      return NextResponse.json({
        success: false,
        message: "Group id is required",
      });
    }

    const groupChat = await prisma.groupChat.findMany({
      where: {
        groupId,
      },

      include: {
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!groupChat) {
      return NextResponse.json({
        success: false,
        message: "No group chat found",
        groupChat: [],
      });
    }
    return NextResponse.json({
      success: true,
      groupChat: groupChat,
    });
  } catch (error) {
    console.error("Get chats error:", error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
