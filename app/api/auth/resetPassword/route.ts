import { ApiError } from "@/lib/ApiError";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/sendMail";
import { NextRequest,NextResponse } from "next/server";
import jwt from "jsonwebtoken"

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req:NextRequest){
    try {
        const{email}=await req.json()
        if(!email){
            throw new ApiError("Email is required",400)
        }
        const checkIsUserAvailable=await prisma.user.findUnique({
            where:{
                email
            }
        })

        if(!checkIsUserAvailable){
            throw new ApiError("User not found please enter a valid email or register",404)
        }
        
        if(!checkIsUserAvailable.isVerified){
            throw new ApiError("User is not verified. Please verify your account first",400)
        }

        const jwtToken=jwt.sign({
            userId:checkIsUserAvailable.id
        },process.env.JWT_SECRET!,{expiresIn:"15m"})

        await prisma.user.update({
            where:{
                id:checkIsUserAvailable.id
            },data:{
                resetPasswordToken:jwtToken,
                resetPasswordTokenExpiration:new Date(Date.now()+15*60*1000)
            }
        })

    

        // Send reset link via email
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${jwtToken}`;
        await sendMail(
            email, 
            `Click here to reset your password: ${resetLink}\n\nThis link will expire in 15 minutes.`
        );

        return NextResponse.json({ 
            success: true, 
            message: "Password reset link sent to your email" 
        });
        
    } catch (error) {
        console.error(error);
        if(error instanceof ApiError){
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}