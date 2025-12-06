import { ApiError } from "@/lib/ApiError";
import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth();
        if (!user) {
            throw new ApiError("Please login first", 401);
        }

        const { groupId } = await request.json();
        
        if (!groupId) {
            throw new ApiError("Group ID is required", 400);
        }

        // Verify group exists
        const group = await prisma.group.findUnique({
            where: { id: groupId }
        });

        if (!group) {
            throw new ApiError("Group not found", 404);
        }

        // Verify user is a member of the group
        const isMember = await prisma.groupMember.findFirst({
            where: {
                groupId: groupId,
                userId: user.userId
            }
        });

        if (!isMember) {
            throw new ApiError("You are not a member of this group", 403);
        }

        // Get all group chats with sender details
        const allGroupChats = await prisma.groupChat.findMany({
            where: {
                groupId: groupId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            count: allGroupChats.length,
            data: allGroupChats
        });

    } catch (error) {
        console.error("Get group chat error:", error);
        
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