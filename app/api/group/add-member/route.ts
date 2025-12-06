import { ApiError } from "@/lib/ApiError";
import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
export async function POST(req:NextRequest){
    try {
        const user=await verifyAuth()
        if(!user){
            throw new ApiError("Please login first",404)
        }
        const{userIds,groupId,role="Member"}=await req.json()

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            throw new ApiError("User IDs array is required and cannot be empty", 400);
        }



        if (!groupId) {
            throw new ApiError("Group ID is required", 400);
        }

        const isGroupAvailable=await prisma.group.findUnique({
            where:{
                id:groupId
            }
        })

        if(!isGroupAvailable){
            throw new ApiError("Incorrect group id please enter correct one",401)
        }

        const isAdmin=await prisma.groupMember.findFirst({
            where:{
                userId:user.userId,
                groupId:groupId,
                role:"Admin"
            }
        })
        if(!isAdmin){
            throw new ApiError("Only group admin can add members",403)
        }

        const isUsersAvailable=await prisma.user.findMany({
            where:{
                id:{in:userIds}
            }
        })

        if(isUsersAvailable && isUsersAvailable.length<userIds.length){
            throw new ApiError("1 or more than one user not found",404)
        }

        const isAlreadyMember=await prisma.groupMember.findMany({
            where:{
                groupId,
                userId:{in:userIds},
            }
        })

        if(isAlreadyMember.length > 0){
            const allIds=isAlreadyMember.map((member)=> member.userId)
            throw new ApiError(`Users already members: ${allIds.join(", ")}`, 400)
        }

        // Add all members in transaction
        const newMembers = await prisma.$transaction(
            userIds.map((userId: string) =>
                prisma.groupMember.create({
                    data: {
                        groupId: groupId,
                        userId: userId,
                        role: role
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true
                            }
                        }
                    }
                })
            )
        );

        return NextResponse.json({
            success: true,
            message: `${newMembers.length} member(s) added successfully`,
            data: newMembers
        });
    


        
    } catch (error) {
        console.error("Add member error:", error);
        
        if(error instanceof ApiError){
            return NextResponse.json(
                { error: error.message },
                { status: error.statusCode }
            );
        }
        
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}