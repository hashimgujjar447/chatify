import { ApiError } from "@/lib/ApiError";
import { verifyAuth } from "@/lib/verifyAuth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Verify logged-in user
    const user = await verifyAuth();

    if (!user || typeof user === 'string' || !user.userId) {
      throw new ApiError("Please login first to send a message", 401);
    }

    // Body data
    const { recieverId, message } = await req.json();

    if (!recieverId || !message) {
      throw new ApiError("Receiver ID and message are required", 400);
    }

    // Create chat message
    const chat = await prisma.chat.create({
      data: {
        senderId: user.userId,
        receiverId: recieverId,
        message: message,
      },
    });

    if (!chat) {
      throw new ApiError("Failed to send message", 500);
    }

    return NextResponse.json({ success: true, chat });

  } catch (error) {

    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
