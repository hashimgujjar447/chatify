import { ApiError } from "@/lib/ApiError";
import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
    try {
        const user = await verifyAuth();
        if (!user) {
            throw new ApiError("Please login first", 401);
        }

        const { groupId } = await request.json();
        
        if (!groupId) {
            throw new ApiError("Group ID is required", 400);
        }

        // Find the group
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                members: true
            }
        });

        if (!group) {
            throw new ApiError("Group not found", 404);
        }

        // Check if user is the creator/admin of the group
        if (group.createdBy !== user.userId) {
            throw new ApiError("Only group creator can delete the group", 403);
        }

        // Delete all related data in transaction
        await prisma.$transaction([
            // Delete all group chats
            prisma.groupChat.deleteMany({
                where: { groupId: groupId }
            }),
            // Delete all group members
            prisma.groupMember.deleteMany({
                where: { groupId: groupId }
            }),
            // Delete the group
            prisma.group.delete({
                where: { id: groupId }
            })
        ]);

        return NextResponse.json({
            success: true,
            message: "Group deleted successfully"
        });

    } catch (error) {
        console.error("Delete group error:", error);
        
        if (error instanceof ApiError) {
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