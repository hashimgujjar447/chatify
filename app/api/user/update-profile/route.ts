import { ApiError } from "@/lib/ApiError";
import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
    try {
        const user = await verifyAuth();
        if (!user) {
            throw new ApiError("Please login first", 401);
        }

        const { name, email, avatar, currentPassword, newPassword } = await request.json();

        // Check if at least one field is provided
        if (!name && !email && !avatar && !newPassword) {
            throw new ApiError("Please provide at least one field to update", 400);
        }

        // If changing email, check if it's already taken
        if (email && email !== user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                throw new ApiError("Email already in use", 400);
            }
        }

        // Build update data
        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (avatar) updateData.avatar = avatar;

        // If changing password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                throw new ApiError("Current password is required to set new password", 400);
            }

            if (newPassword.length < 6) {
                throw new ApiError("New password must be at least 6 characters", 400);
            }

            // Get user's current password
            const userWithPassword = await prisma.user.findUnique({
                where: { id: user.userId }
            });

            if (!userWithPassword?.password) {
                throw new ApiError("User password not found", 500);
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password);
            if (!isPasswordValid) {
                throw new ApiError("Current password is incorrect", 401);
            }

            // Hash new password
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
                createdAt: true
            }
        });

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser
        });

    } catch (error) {
        console.error("Update profile error:", error);

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
