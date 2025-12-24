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
  MessageSquare,
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
      <div className="w-80 border-r border-gray-200 flex flex-col h-screen bg-white shadow-lg">
        {/* HEADER */}
        <div className="px-5 py-5 flex justify-between items-center border-b border-gray-200 bg-gradient-to-r from-teal-500 to-cyan-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <MessageSquare size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Chatify</h1>
          </div>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
              aria-label="Menu"
            >
              <Menu
                className="text-white cursor-pointer group-hover:rotate-90 transition-transform duration-300"
                size={22}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white shadow-2xl rounded-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <div
                  onClick={() => {
                    router.push("/profile");
                    setMenuOpen(false);
                  }}
                  className="px-4 py-3.5 flex items-center gap-3 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 cursor-pointer transition-all group"
                >
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserCircle2 size={18} className="text-teal-600" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-teal-600 transition-colors">
                    Profile
                  </span>
                </div>

                <div
                  onClick={() => {
                    router.push("/profile");
                    setMenuOpen(false);
                  }}
                  className="px-4 py-3.5 flex items-center gap-3 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 cursor-pointer transition-all group"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bell size={18} className="text-orange-600" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-orange-600 transition-colors">
                    Requests
                  </span>
                </div>

                <div
                  onClick={() => setAddContactOpen(true)}
                  className="px-4 py-3.5 flex items-center gap-3 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 cursor-pointer transition-all group"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserRoundPlus size={18} className="text-green-600" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                    Add Contact
                  </span>
                </div>

                <div className="border-t border-gray-100"></div>

                <div
                  onClick={() => router.push("/group")}
                  className="px-4 py-3.5 flex items-center gap-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-all group"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users size={18} className="text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                    Create Group
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEARCH */}
        <div className="px-4 py-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100 outline-none focus:bg-gray-50 focus:ring-2 focus:ring-teal-500 transition-all border border-transparent focus:border-teal-200 text-gray-700 placeholder:text-gray-400"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* GROUPS */}
          {groupChats.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Groups
                </p>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
              {groupChats.map((group, index) => (
                <div
                  key={group.id}
                  onClick={() => onSelectUser({ ...group, type: "group" })}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="flex items-center gap-3 px-3 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl cursor-pointer transition-all duration-200 mb-1 group animate-in fade-in slide-in-from-left"
                >
                  <div className="relative">
                    <div className="w-11 h-11 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">
                      {group.groupImage ? (
                        <img
                          src={group.groupImage}
                          alt={group.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <span>{group.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-purple-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate group-hover:text-purple-600 transition-colors">
                      {group.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Group • {group.groupDescription || "Tap to chat"}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* PRIVATE CHATS */}
          <div className="flex items-center gap-2 px-3 py-2 mb-2 mt-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Direct Messages
            </p>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {privateChats.map((chat, index) => (
            <div
              key={chat.id}
              onClick={() => onSelectUser({ ...chat, type: "private" })}
              style={{
                animationDelay: `${(groupChats.length + index) * 50}ms`,
              }}
              className="flex items-center gap-3 px-3 py-3 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 rounded-xl cursor-pointer transition-all duration-200 mb-1 group animate-in fade-in slide-in-from-left"
            >
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">
                  {chat.avatar ? (
                    <img
                      src={chat.avatar}
                      alt={chat.name || "User"}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span>{chat.name?.charAt(0).toUpperCase() || "U"}</span>
                  )}
                </div>
                {chat.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate group-hover:text-teal-600 transition-colors">
                  {chat.name || "Unknown"}
                </p>
                <p className="text-xs text-gray-500 truncate">{chat.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD CONTACT MODAL */}
      {addContactOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white p-7 rounded-2xl w-96 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center">
                <UserRoundPlus size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Add Contact</h2>
            </div>
            <input
              className="border border-gray-300 w-full px-4 py-3 rounded-xl mb-5 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAddContactOpen(false)}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-teal-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                onClick={handleAddContact}
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;
