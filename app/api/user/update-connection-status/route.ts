import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const loginUser = await verifyAuth();

    if (!loginUser || !loginUser.userId) {
      return NextResponse.json({
        success: false,
        message: "Please login first",
      });
    }

    const { status, senderId } = await req.json();

    if (!status || !senderId) {
      return NextResponse.json({
        success: false,
        message: "Both status and senderId are required",
      });
    }

    // Only valid statuses
    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json({
        success: false,
        message: "Invalid status. Allowed: ACCEPTED or REJECTED",
      });
    }

    // Check if connection exists (this ensures correct record)
    const connection = await prisma.userConnections.findFirst({
      where: {
        senderId,
        receiverId: loginUser.userId,
      }
    });

    if (!connection) {
      return NextResponse.json({
        success: false,
        message: "Connection request not found",
      });
    }

    // Now update the connection status
    const updatedConnection = await prisma.userConnections.update({
      where: {
        id: connection.id, // safer update using id
      },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      message: "Connection request updated successfully",
      data: updatedConnection
    });

  } catch (error) {
    console.error("Error updating connection:", error);

    return NextResponse.json({
      success: false,
      message: "Internal server error while updating connection",
    });
  }
}
