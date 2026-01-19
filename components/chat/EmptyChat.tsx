"use client";
import React from "react";
import { MessageSquare, Users } from "lucide-react";

interface EmptyChatProps {
  isGroup: boolean;
}

export const EmptyChat: React.FC<EmptyChatProps> = ({ isGroup }) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
        {isGroup ? (
          <Users size={32} className="text-purple-600" />
        ) : (
          <MessageSquare size={32} className="text-purple-600" />
        )}
      </div>
      <p className="text-gray-500">
        {isGroup
          ? "No group messages yet. Be the first to say hi!"
          : "No messages yet. Start the conversation!"}
      </p>
    </div>
  );
};
