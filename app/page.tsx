"use client";
import ChatBox from "@/components/ChatBox";
import SideBar from "@/components/SideBar";
import React, { useEffect, useState, useCallback } from "react";
import { refreshUser } from "@/store/features/auth/userSlice";
import { useAppDispatch } from "@/store/hooks/hooks";
import { useRouter } from "next/navigation";

interface SelectedUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  isOnline: boolean | null;
  type: string | null;
}

const HomePage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);

  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch]);

  const handleSelectUser = useCallback((user: any) => {
    setSelectedUser({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isOnline: user.isOnline ?? null,
      type: user.type ?? null,
    });
  }, []);

  const handleOpenMenu = useCallback(() => {
    if (selectedUser?.type === "group" && selectedUser?.id) {
      router.push(`/group/add-member?groupId=${selectedUser.id}`);
    }
  }, [selectedUser, router]);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex relative h-screen overflow-hidden">
      <SideBar onSelectUser={handleSelectUser} />
      <ChatBox selectedUser={selectedUser} handleOpenMenu={handleOpenMenu} />
    </div>
  );
};

export default HomePage;
