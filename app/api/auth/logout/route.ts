import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth();
    console.log("User logging out:", user);

    const updateUser=await prisma?.user.update({
      where:{
        email:user.email
      },data:{
        isOnline:false
      }
    })
    if(!updateUser){
      return NextResponse
    }
    const res = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Delete cookie using overwrite + maxAge: 0
    res.cookies.set({
      name: "auth_token",
      value: "",
      maxAge: 0,
      path: "/",
    });

    return res;

  } catch (error) {
    console.error("Logout Error:", error);

    // If token missing/invalid → return 401 Unauthorized
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
