import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req: NextRequest) {
  try {
    const { groupId }: { groupId: string } = await req.json();
    console.log("gettng all users");
    if (!groupId) {
      return NextResponse.json({
        success: false,
        message: "Group id is required",
      });
    }
    const allUsers = await prisma.user.findMany({});
    if (!allUsers) {
      return NextResponse.json({ success: false, message: "No users found" });
    }

    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    const groupMemberIds = groupMembers.map((m) => m.userId);

    // let onlyUsersWhichAreNotInGroup = await prisma.groupMember.findMany({
    //   where: {
    //     groupId: groupId,
    //   },
    // });
    // console.log(onlyUsersWhichAreNotInGroup);
    // console.log(allUsers);
    // let availableUser = [];

    const availableUsers = await prisma.user.findMany({
      where: {
        id: {
          notIn: groupMemberIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // for (let i = 0; i < onlyUsersWhichAreNotInGroup.length; i++) {
    //   let isAvailable = true;
    //   let j = 0;
    //   while (j < allUsers.length) {
    //     if (onlyUsersWhichAreNotInGroup[i].userId !== allUsers[j].id) {
    //       isAvailable = false;
    //     }
    //     j++;
    //   }
    //   if (!isAvailable) {
    //     availableUser.push({ id: allUsers[i].id, name: allUsers[i].name });
    //   }
    // }

    return NextResponse.json({
      success: true,
      availableUsers,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while fetching connections",
      },
      { status: 500 }
    );
  }
}
