import { ApiError } from "@/lib/ApiError";
import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
    try {
        const user = await verifyAuth();
        if (!user) {
            throw new ApiError("Please login first", 401);
        }

        const { name, groupDescription, groupImage, groupId } = await request.json();

        if (!groupId) {
            throw new ApiError("Group ID is required", 400);
        }

        // Check if at least one field is provided for update
        if (!name && !groupDescription && !groupImage) {
            throw new ApiError("Please provide at least one field to update", 400);
        }

        // Verify group exists
        const group = await prisma.group.findUnique({
            where: { id: groupId }
        });

        if (!group) {
            throw new ApiError("Group not found", 404);
        }

        // Check if user is admin of this specific group
        const checkIsAdmin = await prisma.groupMember.findFirst({
            where: {
                userId: user.userId,
                groupId: groupId,
                role: "Admin"
            }
        });

        if (!checkIsAdmin) {
            throw new ApiError("Only group admin can update the group", 403);
        }

        // Build update data object - only include fields that are provided
        const updateData: any = {};
        if (name) updateData.name = name;
        if (groupDescription !== undefined) updateData.groupDescription = groupDescription;
        if (groupImage !== undefined) updateData.groupImage = groupImage;

        const updateGroup = await prisma.group.update({
            where: {
                id: groupId
            },
            data: updateData,
            include: {
                members: {
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
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: "Group updated successfully",
            data: updateGroup
        });

    } catch (error) {
        console.error("Update group error:", error);
        
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