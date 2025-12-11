import { ApiError } from "@/lib/ApiError";
import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth();
    if (!user) {
      throw new ApiError("Please login first", 401);
    }

    const { receiverId } = await req.json();

    if (!receiverId) {
      throw new ApiError("Receiver ID is required", 400);
    }

    // Check if receiver exists and is verified
    const isReceiverExists = await prisma.user.findFirst({
     where:{
      id:receiverId,
      isVerified:true
     }
    });

    if (!isReceiverExists) {
      throw new ApiError("Receiver not found or not verified", 404);
    }

    // Get all chats between current user and receiver (both directions)
    const getAllChats = await prisma.chat.findMany({
      where: {
        OR: [
          {
            senderId: user.userId,
            receiverId: receiverId
          },
          {
            senderId: receiverId,
            receiverId: user.userId
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isOnline:true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isOnline:true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      count: getAllChats.length,
      data: getAllChats
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
