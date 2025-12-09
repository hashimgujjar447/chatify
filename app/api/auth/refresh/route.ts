import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth();
        
        if (!user || !user.userId) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                userId: user.userId,
                email: user.email || ""
            }
        });
    } catch (error: any) {
        console.error("Refresh auth error:", error);
        return NextResponse.json(
            { error: error.message || "Authentication failed" },
            { status: 401 }
        );
    }
}
