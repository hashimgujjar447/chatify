import { ApiError } from "@/lib/ApiError";
import { prisma } from "@/lib/prisma";
import { NextRequest,NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request:NextRequest,
    {params}:{params:Promise<{token:string}>})
    {
        
    try {
        const token=(await params)?.token
        
        if(!token){
            throw new ApiError("Reset token is required",400)
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as {userId: string};
        } catch (err) {
            throw new ApiError("Invalid or expired reset token",401)
        }
        
        const{password,confirmPassword}=await request.json()

        if(!password||!confirmPassword){
          throw new ApiError("Both password and confirm password is required",400)
        }

        if(password !== confirmPassword){
            throw new ApiError("Passwords do not match",400)
        }

        if(password.length < 6){
            throw new ApiError("Password length must be at least 6 characters",400)
        }

        const checkForResetToken=await prisma.user.findFirst({
            where:{
                resetPasswordToken:token   
            }
        })

        if(!checkForResetToken){
            throw new ApiError("Invalid reset token",404)
        }

        // Check if token is expired
        if(!checkForResetToken.resetPasswordTokenExpiration){
            throw new ApiError("Reset token has expired",401)
        }

        const now = new Date();
        if(now > checkForResetToken.resetPasswordTokenExpiration){
            throw new ApiError("Reset token has expired. Please request a new one",401)
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where:{
                id:checkForResetToken.id
            },data:{
               password: hashedPassword,
               resetPasswordToken: null,
               resetPasswordTokenExpiration: null
            }
        })

        return NextResponse.json({success:true,message:"Password changed successfully"})


    } catch (error) {
        console.error(error);
        if(error instanceof ApiError){
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}