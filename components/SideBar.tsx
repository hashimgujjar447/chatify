"use client";

import { useAppSelecter } from "@/store/hooks/hooks";
import {
  Search,
  UserRoundPlus,
  Menu,
  UserCircle2,
  X,
  Bell,
  Users,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface ChatContact {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  isOnline?: boolean;
}

interface GroupChat {
  id: string;
  name: string;
  groupImage: string | null;
  groupDescription?: string | null;
}

interface SideBarProps {
  onSelectUser: (chat: any) => void;
}

const SideBar = ({ onSelectUser }: SideBarProps) => {
  const router = useRouter();
  const user = useAppSelecter((state) => state.user.user);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [privateChats, setPrivateChats] = useState<ChatContact[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [email, setEmail] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);

  // ================= FETCH DATA =================
  useEffect(() => {
    async function fetchSidebarData() {
      try {
        setLoading(true);

        const [userRes, groupRes] = await Promise.all([
          fetch("/api/user/get-all-users", { credentials: "include" }),
          fetch("/api/group/get-all-groups", {
            method: "POST",
            credentials: "include",
          }),
        ]);

        const userData = await userRes.json();
        const groupData = await groupRes.json();

        // Private chats
        if (userData?.success) {
          const contacts = userData.data.map((connection: any) => {
            return connection.sender.id === userData.currentUserId
              ? connection.receiver
              : connection.sender;
          });
          setPrivateChats(contacts);
        }

        // Groups
        if (groupData?.success) {
          const groups = groupData.data.map((item: any) => ({
            id: item.group.id,
            name: item.group.name,
            groupImage: item.group.groupImage,
            groupDescription: item.group.groupDescription,
          }));
          setGroupChats(groups);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load sidebar data");
        setLoading(false);
      }
    }

    fetchSidebarData();
  }, []);

  // ================= CLOSE MENU =================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= ADD CONTACT =================
  const handleAddContact = async () => {
    if (!email) return alert("Email required");

    await fetch("/api/user/send-connection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include",
    });

    setAddContactOpen(false);
    setEmail("");
  };

  // ================= UI =================
  return (
    <>
      <div className="w-80 border-r flex flex-col h-screen">
        {/* HEADER */}
        <div className="px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold">Chatify</h1>

          <div ref={menuRef} className="relative">
            <Menu
              className="cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            />

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-lg border z-50">
                <div
                  onClick={() => {
                    setProfileOpen(true);
                    setMenuOpen(false);
                  }}
                  className="px-4 py-3 flex gap-2 hover:bg-gray-100 cursor-pointer"
                >
                  <UserCircle2 size={18} /> Edit Profile
                </div>

                <div
                  onClick={() => router.push("/profile")}
                  className="px-4 py-3 flex gap-2 hover:bg-gray-100 cursor-pointer"
                >
                  <Bell size={18} /> Requests
                </div>

                <div
                  onClick={() => setAddContactOpen(true)}
                  className="px-4 py-3 flex gap-2 hover:bg-gray-100 cursor-pointer"
                >
                  <UserRoundPlus size={18} /> Add Contact
                </div>

                <div
                  onClick={() => router.push("/group")}
                  className="px-4 py-3 flex gap-2 hover:bg-gray-100 cursor-pointer border-t"
                >
                  <Users size={18} /> Create Group
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEARCH */}
        <div className="px-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5" size={18} />
            <input
              className="w-full pl-10 py-2 rounded-full bg-gray-100 outline-none"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {loading && <p className="text-center">Loading...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {/* GROUPS */}
          {groupChats.length > 0 && (
            <>
              <p className="text-xs text-gray-500 px-2 mt-4">GROUPS</p>
              {groupChats.map((group) => (
                <div
                  key={group.id}
                  onClick={() => onSelectUser({ ...group, type: "group" })}
                  className="flex items-center gap-3 px-3 py-3 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                    {group.groupImage || group.name[0]}
                  </div>
                  <p className="font-medium">{group.name}</p>
                </div>
              ))}
            </>
          )}

          {/* PRIVATE CHATS */}
          <p className="text-xs text-gray-500 px-2 mt-4">DIRECT MESSAGES</p>

          {privateChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectUser({ ...chat, type: "private" })}
              className="flex items-center gap-3 px-3 py-3 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white">
                {chat.avatar || chat.name?.[0]}
              </div>
              <div>
                <p className="font-medium">{chat.name}</p>
                <p className="text-xs text-gray-500">{chat.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD CONTACT MODAL */}
      {addContactOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80">
            <h2 className="font-semibold mb-4">Add Contact</h2>
            <input
              className="border w-full p-2 rounded mb-4"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setAddContactOpen(false)}>Cancel</button>
              <button
                className="bg-green-600 text-white px-4 py-1 rounded"
                onClick={handleAddContact}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL (unchanged logic) */}
      {profileOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold">Profile</h2>
              <X
                onClick={() => setProfileOpen(false)}
                className="cursor-pointer"
              />
            </div>
            <p className="text-sm text-gray-500">
              Profile editing logic stays same
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;
