import { ApiError } from "@/lib/ApiError";
import { prisma } from "@/lib/prisma";
import { NextRequest,NextResponse } from "next/server";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function comparePassword(userPassword:string,dbPassword:string){
    return bcrypt.compare(userPassword,dbPassword)
}

export async function POST(req:NextRequest){
   try {
    const{email,password}=await req.json()
    if(!email || !password){
        throw new ApiError("Both email and password is required",400)
    }
    const findUser=await prisma.user.findUnique({
        where:{
            email:email
        }
    })
    if(!findUser){
        throw new ApiError("No user with this email is available",404)
    }
    if(!findUser.isVerified){
        throw new ApiError("Please verify your account first",403)
    }
    if(!findUser.password){
        throw new ApiError("User password not set",500)
    }
    const checkPassword = await comparePassword(password,findUser.password)

    if(!checkPassword){
        throw new ApiError("Password is incorrect",401)
    }

    const token=jwt.sign(
        {
            userId:findUser.id,
            email:findUser.email,
            
        },process.env.JWT_SECRET!,{expiresIn:"3d"}
    )



    // Remove password from response
    const { password: _, ...userWithoutPassword } = findUser;

    const res=NextResponse.json({success:true, user: userWithoutPassword})

    res.cookies.set(
        {
            name:"auth_token",
            value:token,
            httpOnly:true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:"/",
            maxAge:60*60*24*3 // 3 days to match JWT expiry
        }
    )

    return res;

   } catch (error) {
    console.error(error);
    if(error instanceof ApiError){
             return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
   }
}