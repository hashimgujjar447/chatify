"use client";
import React, { memo, useState } from "react";
import { Phone, Video, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  selectedChatUser: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
    isOnline: boolean | null;
    type?: string | null;
  };
  handleOpenMenu: () => void;
}

const Header = memo(({ selectedChatUser, handleOpenMenu }: HeaderProps) => {
  const isGroup = selectedChatUser.type === "group";
  const [showGroupSettingsMenu, setGroupSettingsMenu] =
    useState<boolean>(false);
  const router = useRouter();

  return (
    <div className="flex items-center relative px-6 py-4 justify-between border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center rounded-full overflow-hidden ring-2 ring-white shadow-md">
            {selectedChatUser.avatar ? (
              <img
                src={selectedChatUser.avatar}
                alt={selectedChatUser.name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {selectedChatUser.name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
          {!isGroup && selectedChatUser.isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedChatUser.name || "Unknown"}
          </h2>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            {isGroup ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                Group
              </span>
            ) : selectedChatUser.isOnline ? (
              <span className="text-green-600 font-medium">● Online</span>
            ) : (
              <span className="text-gray-400">○ Offline</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center text-gray-600 gap-2">
        <button
          className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 group"
          aria-label="Video call"
        >
          <Video
            size={22}
            className="group-hover:text-teal-600 transition-colors"
          />
        </button>
        <button
          className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 group"
          aria-label="Voice call"
        >
          <Phone
            size={22}
            className="group-hover:text-teal-600 transition-colors"
          />
        </button>
        <button
          onClick={() => {
            if (isGroup) {
              router.push(`/group/${selectedChatUser.id}/settings`);
            }
          }}
          className="p-2.5 hover:bg-teal-50 rounded-full transition-all duration-200 hover:scale-110 group"
          aria-label="More options"
        >
          <MoreVertical
            size={22}
            className="group-hover:text-teal-600 transition-colors"
          />
        </button>
      </div>
    </div>
  );
});

Header.displayName = "Header";

export default Header;
