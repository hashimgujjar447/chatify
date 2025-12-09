import { ApiError } from "@/lib/ApiError";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/verifyAuth";

export async function POST(req: NextRequest) {
  try {
    const loginUser = await verifyAuth();

    if (!loginUser || !loginUser.userId) {
      return NextResponse.json({
        success: false,
        message: "Please login first",
      });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Please provide an email",
      });
    }

    // 1. Check receiver exists
    const receiverUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!receiverUser) {
      return NextResponse.json({
        success: false,
        message: "This email is not registered",
      });
    }

    // Prevent sending to self
    if (receiverUser.id === loginUser.userId) {
      return NextResponse.json({
        success: false,
        message: "You cannot send a connection request to yourself",
      });
    }

    // 2. Check if connection already exists
    const existingConnection = await prisma.userConnections.findFirst({
      where: {
        OR: [
          {
            senderId: loginUser.userId,
            receiverId: receiverUser.id,
          },
          {
            senderId: receiverUser.id,
            receiverId: loginUser.userId,
          },
        ],
      },
    });

    if (existingConnection) {
      return NextResponse.json({
        success: false,
        message: "Connection already exists",
      });
    }

    // 3. Create new connection request (PENDING)
    const sendConnectionRequest = await prisma.userConnections.create({
      data: {
        senderId: loginUser.userId,
        receiverId: receiverUser.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Connection request sent successfully",
      data: sendConnectionRequest,
    });
  } catch (error) {
    console.error("Error:", error);

    return NextResponse.json({
      success: false,
      message: "Internal server error while sending connection request",
    });
  }
}
