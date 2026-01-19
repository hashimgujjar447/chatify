"use client";
import { useEffect } from "react";
import { Socket } from "socket.io-client";
import { Chat, GroupChat, SelectedUser } from "./types";
import { getRoomId } from "./utils";

interface UseChatHandlersProps {
  selectedUser: SelectedUser | null;
  loginUserId: string | undefined;
  socket: Socket | null;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setGroupChats: React.Dispatch<React.SetStateAction<GroupChat[]>>;
}

export const useChatHandlers = ({
  selectedUser,
  loginUserId,
  socket,
  setChats,
  setGroupChats,
}: UseChatHandlersProps) => {
  useEffect(() => {
    if (!selectedUser?.id || !loginUserId || !socket) {
      return;
    }

    const roomIdValue = getRoomId(loginUserId, selectedUser.id);
    const groupId = selectedUser.id;

    // Handler for receiving group messages
    const handleReceiveGroupMessage = (data: GroupChat) => {
      if (data.senderId !== loginUserId) {
        setGroupChats((prev) => [
          ...prev,
          {
            ...data,
            createdAt: data.timestamp,
          },
        ]);
      }
    };

    // Handler for receiving private messages
    const handleReceiveMessage = (data: Chat) => {
      if (data.senderId !== loginUserId) {
        setChats((prev) => [
          ...prev,
          {
            ...data,
            createdAt: data.timestamp,
          },
        ]);
      }
    };

    // Handler for deleting group message for everyone
    const handleDeleteMessageGroup = (messageId: string) => {
      console.log("🔥 [CLIENT] handleDeleteMessageGroup TRIGGERED!");
      console.log("MessageId:", messageId);

      setGroupChats((prev) => {
        const exists = prev.find((chat) => chat.id === messageId);

        if (!exists) {
          console.log("⚠️ Message not found in list");
          return prev;
        }

        console.log("✅ Message filtered out from receiver's view");
        return prev.filter((chat) => chat.id !== messageId);
      });
    };

    // Handler for deleting private message for everyone
    const handleDeleteMessage = (chatId: string) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === chatId
            ? {
                ...chat,
                isDeletedForEveryone: true,
                message: "Message deleted by sender",
              }
            : chat,
        ),
      );
    };

    // Setup listeners based on chat type
    if (selectedUser.type === "private") {
      socket.on("new-message", handleReceiveMessage);
      socket.on("delete-message-res", handleDeleteMessage);
      socket.emit("join-room", { roomId: roomIdValue });
    } else if (selectedUser.type === "group") {
      socket.on("new-group-message", handleReceiveGroupMessage);
      socket.on("delete-group-everyone-message-res", handleDeleteMessageGroup);
      socket.emit("join-group-room", { groupId: groupId });
    }

    // Cleanup listeners
    return () => {
      if (selectedUser.type === "private") {
        socket.off("new-message", handleReceiveMessage);
        socket.off("delete-message-res", handleDeleteMessage);
      } else if (selectedUser.type === "group") {
        socket.off("new-group-message", handleReceiveGroupMessage);
        socket.off(
          "delete-group-everyone-message-res",
          handleDeleteMessageGroup,
        );
      }
    };
  }, [selectedUser?.id, loginUserId, socket, setChats, setGroupChats]);
};
