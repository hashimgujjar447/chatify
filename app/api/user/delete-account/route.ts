import { ApiError } from "@/lib/ApiError";
import { verifyAuth } from "@/lib/verifyAuth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
    try {
        const user = await verifyAuth();
        if (!user) {
            throw new ApiError("Please login first", 401);
        }

        const { password, confirmDelete } = await request.json();

        // Require password confirmation
        if (!password) {
            throw new ApiError("Password is required to delete account", 400);
        }

        // Require explicit confirmation
        if (confirmDelete !== true) {
            throw new ApiError("Please confirm account deletion", 400);
        }

        // Get user's password
        const userWithPassword = await prisma.user.findUnique({
            where: { id: user.userId }
        });

        if (!userWithPassword?.password) {
            throw new ApiError("User not found", 404);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, userWithPassword.password);
        if (!isPasswordValid) {
            throw new ApiError("Incorrect password", 401);
        }

        // Delete all user data in transaction
        await prisma.$transaction([
            // Delete user's group chats
            prisma.groupChat.deleteMany({
                where: { senderId: user.userId }
            }),
            // Delete user's group memberships
            prisma.groupMember.deleteMany({
                where: { userId: user.userId }
            }),
            // Delete groups created by user
            prisma.group.deleteMany({
                where: { createdBy: user.userId }
            }),
            // Delete sent messages
            prisma.chat.deleteMany({
                where: { senderId: user.userId }
            }),
            // Delete received messages
            prisma.chat.deleteMany({
                where: { receiverId: user.userId }
            }),
            // Finally, delete the user
            prisma.user.delete({
                where: { id: user.userId }
            })
        ]);

        // Clear auth cookie
        const cookieStore = await cookies();
        cookieStore.delete("auth_token");

        return NextResponse.json({
            success: true,
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.error("Delete account error:", error);

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
