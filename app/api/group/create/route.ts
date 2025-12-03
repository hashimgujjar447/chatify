import { ApiError } from "@/lib/ApiError";
import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth();
    const { name, description } = await req.json();

    if (!name) {
      throw new ApiError("Please enter name of the group", 400);
    }

    if (!user || typeof user === "string" || !user.userId) {
      throw new ApiError("Please login first", 401);
    }

    const group = await prisma.group.create({
  data: {
    name,
    groupDescription: description || "",
    createdBy: user.userId,
  },
});

// Add creator as admin
await prisma.groupMember.create({
  data: {
    groupId: group.id,
    userId: user.userId,
    role: "admin",
  },
});

    return NextResponse.json({
      success: true,
      group,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Unexpected Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
