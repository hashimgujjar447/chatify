import bcrypt from "bcrypt"
import { NextRequest,NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/ApiError"

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request:NextRequest){
    try {
        const {otpCode,email}=await request.json()

        if(!email || !otpCode){
            throw new ApiError("Email and OTP code are required",400)
        }

        const isUserAvailable=await prisma.user.findUnique({where:{email}})

        if(!isUserAvailable){
            throw new ApiError("No user of such email available.",404)
        }

        if(!isUserAvailable.otpCode || !isUserAvailable.otpCodeExpiration){
            throw new ApiError("No OTP found. Please request a new one.",400)
        }

        // Check if OTP is expired
        const now = new Date();
        if(now > isUserAvailable.otpCodeExpiration){
            throw new ApiError("OTP has expired. Please request a new one.",400)
        }

        // Compare OTP (otpCode from request with hashed otpCode from DB)
        const isOtpValid = await bcrypt.compare(otpCode, isUserAvailable.otpCode)
        
        if(!isOtpValid){
            throw new ApiError("Invalid OTP code",401)
        }

        // Update user as verified
        await prisma.user.update({
            where:{email},
            data:{
                isVerified:true,
                otpCode: null,
                otpCodeExpiration: null
            }
        })

        return NextResponse.json({ success: true, message: "User verified successfully" })
        
    } catch (error) {
        console.error(error);
        if(error instanceof ApiError){
             return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}