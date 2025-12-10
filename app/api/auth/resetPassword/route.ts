import { ApiError } from "@/lib/ApiError";
import { prisma } from "@/lib/prisma";
import { sendMailNodemailer } from "@/lib/sendMailNodemailer";
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
        await sendMailNodemailer(
            email,
            "Password Reset Request",
            `<h2>Password Reset Request</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>Or copy this link: ${resetLink}</p>
            <p>This link will expire in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>`
        );

        return NextResponse.json({ 
            success: true, 
            message: "Password reset link sent to your email" 
        });
        
    } catch (error) {
        console.error(error);
        if(error instanceof ApiError){
            return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}