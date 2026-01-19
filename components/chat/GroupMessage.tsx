"use client";
import React from "react";
import { ChevronDown, Trash2, UserMinus } from "lucide-react";
import { GroupChat } from "./types";
import { getFormattedTime, canDeleteForEveryone } from "./utils";

interface GroupMessageProps {
  chat: GroupChat;
  isSentByMe: boolean;
  loginUserId: string;
  showChevron: string;
  showDeleteMenu: string;
  deleteMenuRef: React.RefObject<HTMLDivElement>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onToggleMenu: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
}

export const GroupMessage: React.FC<GroupMessageProps> = ({
  chat,
  isSentByMe,
  loginUserId,
  showChevron,
  showDeleteMenu,
  deleteMenuRef,
  onMouseEnter,
  onMouseLeave,
  onToggleMenu,
  onDeleteForMe,
  onDeleteForEveryone,
}) => {
  return (
    <div
      className={`flex ${isSentByMe ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
    >
      <div
        className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-md relative transition-all hover:shadow-lg ${
          isSentByMe
            ? "bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-br-none"
            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Sender name for received messages */}
        {!isSentByMe && (
          <p className="text-xs font-semibold text-purple-600 mb-1.5">
            {chat.senderId}
          </p>
        )}

        {/* Image if exists */}
        {chat.messageType === "image" && chat.attachmentUrl && (
          <img
            src={chat.attachmentUrl}
            alt="Chat image"
            className="rounded-lg max-w-full mb-2 cursor-pointer"
            onClick={() => window.open(chat.attachmentUrl!, "_blank")}
          />
        )}

        {/* Message text */}
        {chat.message && (
          <p className="text-[15px] break-words leading-relaxed">
            {chat.message}
          </p>
        )}

        {/* Timestamp */}
        <span
          className={`text-xs mt-1 block ${isSentByMe ? "text-purple-100" : "text-gray-500"}`}
        >
          {getFormattedTime(chat.createdAt)}
        </span>

        {/* Chevron menu button */}
        {showChevron === chat.id && (
          <button
            onClick={onToggleMenu}
            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
          >
            <ChevronDown size={16} className="text-gray-600" />
          </button>
        )}

        {/* Delete menu */}
        {showDeleteMenu === chat.id && (
          <div
            ref={deleteMenuRef}
            className="absolute top-8 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 px-3 z-10 min-w-[200px]"
          >
            <button
              onClick={onDeleteForMe}
              className="flex items-center gap-2 text-black hover:text-red-600 mb-2"
            >
              <Trash2 size={18} />
              Delete for me
            </button>
            {isSentByMe && canDeleteForEveryone(chat.createdAt) && (
              <button
                onClick={onDeleteForEveryone}
                className="flex items-center gap-2 text-black hover:text-red-600"
              >
                <UserMinus size={18} />
                Delete for everyone
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
