import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth();
        return NextResponse.json({ 
            success: true, 
            message: "Authentication working!", 
            user 
        });
    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 401 });
    }
}
