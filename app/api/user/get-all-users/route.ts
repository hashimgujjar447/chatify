import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const loginUser = await verifyAuth();

    if (!loginUser || !loginUser.userId) {
      return NextResponse.json(
        { success: false, message: "Please login first" },
        { status: 401 }
      );
    }

    const connections = await prisma.userConnections.findMany({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: loginUser.userId },
          { receiverId: loginUser.userId }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, email: true, avatar: true,isOnline:true } },
        receiver: { select: { id: true, name: true, email: true, avatar: true,isOnline:true } }
      },
      orderBy: { createdAt: "desc" }
    });

    if (connections.length === 0) {
      return NextResponse.json(
        { success: false, message: "No contacts available, please add some", data: [], currentUserId: loginUser.userId },
        { status: 200 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: connections, 
      currentUserId: loginUser.userId 
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while fetching connections"
      },
      { status: 500 }
    );
  }
}
