-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "otpCode" TEXT,
    "otpCodeExpiration" TIMESTAMP(3),
    "resetPasswordToken" TEXT,
    "resetPasswordTokenExpiration" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "registrationAttempts" INTEGER NOT NULL DEFAULT 0,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("chatId")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupDescription" TEXT,
    "groupImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupChat" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupChat" ADD CONSTRAINT "GroupChat_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupChat" ADD CONSTRAINT "GroupChat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
