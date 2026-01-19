"use client";
import React, { useEffect, useState, useRef } from "react";
import Header from "./header";
import { Lock, Zap } from "lucide-react";
import { useAppSelecter } from "@/store/hooks/hooks";
import { Chat, GroupChat, SelectedUser } from "./chat/types";
import { ChatMessage } from "./chat/ChatMessage";
import { GroupMessage } from "./chat/GroupMessage";
import { ChatInput } from "./chat/ChatInput";
import { EmptyChat } from "./chat/EmptyChat";
import { useChatHandlers } from "./chat/useChatHandlers";
import { useSendMessage } from "./chat/useSendMessage";

export interface ChatBoxProps {
  selectedUser?: SelectedUser | null;
  handleOpenMenu?: () => void;
}

const ChatBox = ({ selectedUser = null, handleOpenMenu }: ChatBoxProps) => {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [groupChat, setGroupChats] = useState<GroupChat[]>([]);
  const user = useAppSelecter((state) => state.user.user);
  const loginUserId = user?.userId;
  const socket = useAppSelecter((state) => state.socket);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Image handling
  const [openSendImageFile, setOpenSendImageOrFileMenu] =
    useState<boolean>(false);
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [chatImagepreview, setChatImagepreview] = useState<string | null>(null);

  // Menu states
  const [showMessageChevron, setShowMessageChevron] = useState<string>("");
  const [showMessageDeleteMenu, setShowMessageDeleteMenu] =
    useState<string>("");
  const [showGroupMessageChevron, setShowGroupMessageChevron] =
    useState<string>("");
  const [showGroupMessageDeleteMenu, setShowGroupMessageDeleteMenu] =
    useState<string>("");

  const deleteMessageMenu = useRef<HTMLDivElement>(null!);
  const deleteMessageGroupMenu = useRef<HTMLDivElement>(null!);

  // Custom hooks
  useChatHandlers({
    selectedUser,
    loginUserId,
    socket: socket.socket,
    setChats,
    setGroupChats,
  });

  const { sendMessage: sendMessageHook } = useSendMessage({
    selectedUser,
    loginUserId,
    socket: socket.socket,
    setChats,
    setGroupChats,
  });

  // Cleanup image preview on unmount
  useEffect(() => {
    return () => {
      if (chatImagepreview) {
        URL.revokeObjectURL(chatImagepreview);
      }
    };
  }, [chatImagepreview]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chats, groupChat]);

  // Close delete menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        deleteMessageMenu.current &&
        !deleteMessageMenu.current.contains(event.target as Node)
      ) {
        setShowMessageDeleteMenu("");
      }
      if (
        deleteMessageGroupMenu.current &&
        !deleteMessageGroupMenu.current.contains(event.target as Node)
      ) {
        setShowGroupMessageDeleteMenu("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch chat history
  useEffect(() => {
    if (!selectedUser?.id) return;

    const fetchChats = async () => {
      try {
        if (selectedUser.type === "group") {
          const response = await fetch("/api/group/get-group-chat", {
            method: "POST",
            body: JSON.stringify({ groupId: selectedUser.id }),
            headers: { "Content-Type": "application/json" },
          });
          const data = await response.json();
          if (data.success) setGroupChats(data.data);
        } else if (selectedUser.type === "private") {
          const response = await fetch("/api/chat/get-chat-with-current-user", {
            method: "POST",
            body: JSON.stringify({ receiverId: selectedUser.id }),
            headers: { "Content-Type": "application/json" },
          });
          const data = await response.json();
          if (data.success) setChats(data.data);
        }
      } catch (error) {
        console.error("Get chats error:", error);
      }
    };

    fetchChats();
  }, [selectedUser?.id]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!message.trim() && !chatImage) return;

    const success = await sendMessageHook(message, chatImage);

    if (success) {
      setMessage("");
      if (chatImage) {
        setChatImage(null);
        if (chatImagepreview) {
          URL.revokeObjectURL(chatImagepreview);
        }
        setChatImagepreview(null);
      }
    }
  };

  // Delete handlers for private messages
  const handleDeleteForMe = async (chat: Chat) => {
    try {
      const res = await fetch("/api/chat/delete-message-from-me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUser?.id,
          chatId: chat.chatId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChats((prev) =>
          prev.map((c) =>
            c.chatId === chat.chatId ? { ...c, isDeletedBySender: true } : c,
          ),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteForEveryone = async (chat: Chat) => {
    try {
      const res = await fetch("/api/chat/delete-from-everyone", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUser?.id,
          chatId: chat.chatId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const roomIdValue = [loginUserId, selectedUser?.id].sort().join("-");
        socket.socket?.emit("delete-message-everyWhere", {
          roomId: roomIdValue,
          chatId: chat.chatId,
        });
        setChats((prev) =>
          prev.map((c) =>
            c.chatId === chat.chatId
              ? {
                  ...c,
                  isDeletedForEveryone: true,
                  message: "Message deleted by sender",
                }
              : c,
          ),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Delete handlers for group messages
  const handleDeleteGroupForMe = async (chat: GroupChat) => {
    try {
      const res = await fetch("/api/group/delete-message", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: selectedUser?.id,
          groupMessageId: chat.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGroupChats((prev) => prev.filter((p) => p.id !== chat.id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteGroupForEveryone = async (chat: GroupChat) => {
    try {
      const res = await fetch("/api/group/delete-message-for-everyone", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: selectedUser?.id,
          groupMessageId: chat.id,
        }),
      });
      const data = await res.json();
      if (data.success && selectedUser) {
        socket.socket?.emit("delete-group-message-from-all", {
          groupId: selectedUser.id,
          messageId: chat.id,
        });
        setGroupChats((prev) => prev.filter((p) => p.id !== chat.id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Filter messages
  const filteredChats = chats.filter((chat) => {
    const isSent = chat.senderId === loginUserId;
    if (isSent && chat.isDeletedBySender) return false;
    if (!isSent && chat.isDeletedByReceiver) return false;
    return true;
  });

  const filteredGroupChats = groupChat.filter((chat) => {
    if (chat.isDeletedForAll) return false;
    const myStatus = chat.statuses?.find((s) => s.user.id === loginUserId);
    if (myStatus?.isDeleted) return false;
    return true;
  });

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Lock size={64} className="text-purple-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          End-to-End Encrypted
        </h2>
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
      <Header
        selectedChatUser={selectedUser}
        handleOpenMenu={handleOpenMenu || (() => {})}
      />

      {/* Messages container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
      >
        {selectedUser.type === "private" ? (
          filteredChats.length > 0 ? (
            filteredChats.map((chat, index) => (
              <ChatMessage
                key={chat.chatId || index}
                chat={chat}
                isSentByMe={chat.senderId === loginUserId}
                loginUserId={loginUserId!}
                showChevron={showMessageChevron}
                showDeleteMenu={showMessageDeleteMenu}
                deleteMenuRef={deleteMessageMenu}
                onMouseEnter={() => setShowMessageChevron(chat.chatId)}
                onMouseLeave={() => setShowMessageChevron("")}
                onToggleMenu={() =>
                  setShowMessageDeleteMenu(
                    showMessageDeleteMenu === chat.chatId ? "" : chat.chatId,
                  )
                }
                onDeleteForMe={() => handleDeleteForMe(chat)}
                onDeleteForEveryone={() => handleDeleteForEveryone(chat)}
              />
            ))
          ) : (
            <EmptyChat isGroup={false} />
          )
        ) : selectedUser.type === "group" ? (
          filteredGroupChats.length > 0 ? (
            filteredGroupChats.map((chat, index) => (
              <GroupMessage
                key={chat.id || index}
                chat={chat}
                isSentByMe={chat.senderId === loginUserId}
                loginUserId={loginUserId!}
                showChevron={showGroupMessageChevron}
                showDeleteMenu={showGroupMessageDeleteMenu}
                deleteMenuRef={deleteMessageGroupMenu}
                onMouseEnter={() => setShowGroupMessageChevron(chat.id)}
                onMouseLeave={() => setShowGroupMessageChevron("")}
                onToggleMenu={() =>
                  setShowGroupMessageDeleteMenu(
                    showGroupMessageDeleteMenu === chat.id ? "" : chat.id,
                  )
                }
                onDeleteForMe={() => handleDeleteGroupForMe(chat)}
                onDeleteForEveryone={() => handleDeleteGroupForEveryone(chat)}
              />
            ))
          ) : (
            <EmptyChat isGroup={true} />
          )
        ) : null}
      </div>

      {/* Input component */}
      <ChatInput
        message={message}
        chatImage={chatImage}
        chatImagePreview={chatImagepreview}
        openImageMenu={openSendImageFile}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
        onImageSelect={(url, preview) => {
          setChatImage(url);
          setChatImagepreview(preview);
        }}
        onImageRemove={() => {
          setChatImage(null);
          if (chatImagepreview) {
            URL.revokeObjectURL(chatImagepreview);
          }
          setChatImagepreview(null);
        }}
        onToggleImageMenu={() => setOpenSendImageOrFileMenu(!openSendImageFile)}
      />
    </div>
  );
};

export default ChatBox;
