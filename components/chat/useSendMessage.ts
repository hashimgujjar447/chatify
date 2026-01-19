"use client";
import { Socket } from "socket.io-client";
import { Chat, GroupChat, SelectedUser } from "./types";

interface UseSendMessageProps {
  selectedUser: SelectedUser | null;
  loginUserId: string | undefined;
  socket: Socket | null;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setGroupChats: React.Dispatch<React.SetStateAction<GroupChat[]>>;
}

export const useSendMessage = ({
  selectedUser,
  loginUserId,
  socket,
  setChats,
  setGroupChats,
}: UseSendMessageProps) => {
  const sendGroupMessage = async (
    message: string,
    chatImage: string | null,
  ) => {
    if (!selectedUser?.id || !loginUserId) {
      alert("Required data missing");
      return false;
    }

    const messageType = chatImage ? "image" : "text";
    const attachmentUrl = chatImage;

    const res = await fetch("/api/group/group-chat", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        groupId: selectedUser.id,
        message: message || "",
        messageType: messageType,
        chatImage: attachmentUrl,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to send chat");
    }

    const data = await res.json();

    const newMessage = {
      id: data.data.id,
      senderId: loginUserId,
      groupId: selectedUser.id,
      message: message || "",
      timestamp: data.data.createdAt,
      createdAt: data.data.createdAt,
      messageType: data.data.messageType,
      attachmentUrl: data.data.attachmentUrl,
      statuses: data.data.statuses,
    };

    setGroupChats((prev) => [...prev, newMessage]);

    // Emit to socket
    socket?.emit("send-group-message", {
      chatId: data.data.id,
      groupId: selectedUser.id,
      senderId: loginUserId,
      message: message || "",
      messageType: data.data.messageType,
      attachmentUrl: data.data.attachmentUrl,
      timestamp: data.data.createdAt,
    });

    return true;
  };

  const sendPrivateMessage = async (
    message: string,
    chatImage: string | null,
  ) => {
    if (!selectedUser?.id || !loginUserId) {
      alert("Required data missing");
      return false;
    }

    const messageType = chatImage ? "image" : "text";
    const attachmentUrl = chatImage;

    const res = await fetch("/api/chat/SendMessage", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        receiverId: selectedUser.id,
        message: message || "",
        attachmentUrl: attachmentUrl,
        messageType: messageType,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to send chat");
    }

    const data = await res.json();
    const roomIdValue = [loginUserId, selectedUser.id].sort().join("-");

    const newMessage = {
      chatId: data.chat.chatId,
      senderId: loginUserId,
      receiverId: selectedUser.id,
      message: message || "",
      timestamp: data.chat.createdAt,
      createdAt: data.chat.createdAt,
      messageType: data.chat.messageType,
      attachmentUrl: data.chat.attachmentUrl,
      isDeletedBySender: false,
      isDeletedByReceiver: false,
      isDeletedForEveryone: false,
    };

    setChats((prev) => [...prev, newMessage]);

    // Emit to socket
    socket?.emit("send-message", {
      chatId: data.chat.chatId,
      roomId: roomIdValue,
      senderId: loginUserId,
      receiverId: selectedUser.id,
      message: message || "",
      messageType: data.chat.messageType,
      attachmentUrl: data.chat.attachmentUrl,
      timestamp: data.chat.createdAt,
    });

    return true;
  };

  const sendMessage = async (message: string, chatImage: string | null) => {
    try {
      if (selectedUser?.type === "group") {
        return await sendGroupMessage(message, chatImage);
      } else if (selectedUser?.type === "private") {
        return await sendPrivateMessage(message, chatImage);
      }
      return false;
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
      return false;
    }
  };

  return { sendMessage };
};
