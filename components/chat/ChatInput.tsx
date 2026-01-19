"use client";
import React, { useState } from "react";
import { Plus, Image as ImageIcon } from "lucide-react";

interface ChatInputProps {
  message: string;
  chatImage: string | null;
  chatImagePreview: string | null;
  openImageMenu: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onImageSelect: (url: string, preview: string) => void;
  onImageRemove: () => void;
  onToggleImageMenu: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  message,
  chatImage,
  chatImagePreview,
  openImageMenu,
  onMessageChange,
  onSendMessage,
  onImageSelect,
  onImageRemove,
  onToggleImageMenu,
}) => {
  const handleImageUpload = async (file: File) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    onImageSelect(data.url, data.url);
    onToggleImageMenu();
  };

  return (
    <div className="bg-white px-6 py-4 border-t relative border-gray-200 shadow-lg">
      <div className="flex items-center gap-3">
        {/* Emoji button */}
        <button className="text-gray-500 hover:text-teal-600 p-2.5 hover:bg-teal-50 rounded-xl transition-all hover:scale-110 group">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {/* Add image/file button */}
        <button
          onClick={onToggleImageMenu}
          className="text-gray-500 hover:text-teal-600 p-2.5 hover:bg-teal-50 rounded-xl transition-all hover:scale-110 group"
        >
          <Plus />
        </button>

        {/* Message input */}
        <input
          type="text"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && (message.trim() || chatImage)) {
              onSendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 text-gray-900 px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all border border-transparent focus:border-teal-200"
        />

        {/* Send button */}
        <button
          onClick={onSendMessage}
          disabled={!message.trim() && !chatImage}
          className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-3 rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:scale-110 active:scale-95 disabled:hover:scale-100"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      {/* Image preview */}
      {chatImage && chatImagePreview && (
        <div className="absolute bottom-20 left-4 bg-white shadow-2xl rounded-xl p-3 border border-gray-200 z-50">
          <div className="relative">
            <img
              src={chatImagePreview}
              alt="Chat image preview"
              className="w-32 h-32 object-cover rounded-lg"
            />
            <button
              onClick={onImageRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Image menu */}
      {openImageMenu && (
        <div className="absolute bottom-20 flex flex-col gap-y-3 left-4 bg-white shadow-lg rounded p-3 border border-gray-200 z-40">
          <label className="flex hover:rounded hover:shadow cursor-pointer p-2 gap-x-2">
            <ImageIcon className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded hover:from-teal-600 text-white hover:to-cyan-700 transition-all" />
            Add Image
            <input
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              type="file"
              accept="image/*"
              hidden
            />
          </label>
        </div>
      )}
    </div>
  );
};
