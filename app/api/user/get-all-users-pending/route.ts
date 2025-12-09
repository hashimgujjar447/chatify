import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const loginUser = await verifyAuth();

    if (!loginUser || !loginUser.userId) {
      return NextResponse.json({ success: false, message: "Please login first" });
    }

    // Fetch pending requests WHERE the user is the RECEIVER
    const pendingRequests = await prisma.userConnections.findMany({
      where: {
        status: "PENDING",
        receiverId: loginUser.userId
      },
      include: {
        sender: { select: { id: true, name: true, email: true, avatar: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    if (pendingRequests.length === 0) {
      return NextResponse.json({ success: false, message: "No pending requests" });
    }

    // Format response: show sender info only
    const formatted = pendingRequests.map(req => ({
      connectionId: req.id,
      sender: req.sender,
      createdAt: req.createdAt
    }));

    return NextResponse.json({ success: true, data: formatted });

  } catch (error) {
    console.error("Error fetching pending connections:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error while fetching pending requests"
    });
  }
}
