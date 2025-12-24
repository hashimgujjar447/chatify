import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { prisma } from "@/lib/prisma";
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth();

    if (!user || !user.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const useDatar = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        userId: useDatar?.id,
        email: useDatar?.email || "",
        avatar: useDatar?.avatar,
        name: useDatar?.name,
      },
    });
  } catch (error: any) {
    console.error("Refresh auth error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 401 }
    );
  }
}
