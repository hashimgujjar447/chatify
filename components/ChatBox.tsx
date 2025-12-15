"use client";
import React, { useEffect, useState, useRef } from "react";
import Header from "./header";
import { MessageSquare, Users, Lock, Zap } from "lucide-react";
import { useAppSelecter } from "@/store/hooks/hooks";

export interface ChatBoxProps {
  selectedUser?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
    isOnline: boolean | null;
    type: string | null;
  } | null;
}

interface Chat {
  timestamp: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  dateSent?: string;
}
interface GroupChat {
  chatId: string;
  senderId: string;
  groupId: string;
  message: string;
  createdAt: string;
  dateSent?: string;
  messageType: string;
  timestamp: string;
}
const ChatBox = ({ selectedUser = null }: ChatBoxProps) => {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [groupChat, setGroupChats] = useState<GroupChat[]>([]);
  const user = useAppSelecter((state) => state.user.user);
  const loginUserId = user?.userId;
  const socket = useAppSelecter((state) => state.socket);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  function getDate(date: string): string {
    const d = new Date(date);
    const getTime = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return getTime;
  }

  function roomId(senderId: string, receiverId: string): string {
    return [senderId, receiverId].sort().join("-");
  }

  const handleSendMessage = async (message: string) => {
    try {
      if (!message || !selectedUser?.id || !loginUserId) {
        alert("Message is required");
        return;
      }
      if (selectedUser.type === "group") {
        const res = await fetch("/api/group/group-chat", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            groupId: selectedUser.id,
            message: message,
          }),
        });

        if (!res.ok) {
          alert("Failed to send chat");
          return;
        }
        const data = await res.json();
        console.log("✅ [ChatBox] Group message saved to DB:", data);

        const newMessage = {
          chatId: data.data.id,
          senderId: loginUserId,
          groupId: selectedUser.id,
          message: message,
          timestamp: data.data.createdAt,
          createdAt: data.data.createdAt,
          messageType: data.data.messageType,
        };

        setGroupChats((prev) => [...prev, newMessage]);

        // Emit to socket so other group members get it
        socket.socket?.emit("send-group-message", {
          chatId: data.data.id,
          groupId: selectedUser.id,
          senderId: loginUserId,
          message: message,
          timestamp: data.data.createdAt,
        });
        console.log("📤 [ChatBox] Group message emitted to socket");
      } else if (selectedUser.type === "private") {
        const res = await fetch("/api/chat/SendMessage", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            receiverId: selectedUser.id,
            message: message,
          }),
        });

        if (!res.ok) {
          alert("Failed to send chat");
          return;
        }

        const data = await res.json();
        console.log("✅ [ChatBox] Message saved to DB:", data);
        const getRoomId = roomId(loginUserId, selectedUser.id);

        // Add message to local state immediately (sender sees it)
        const newMessage = {
          chatId: data.chat.chatId,
          senderId: loginUserId,
          receiverId: selectedUser.id,
          message: message,
          timestamp: data.chat.createdAt,
          createdAt: data.chat.createdAt,
        };

        setChats((prev) => [...prev, newMessage]);

        // Emit to socket so receiver gets it
        socket.socket?.emit("send-message", {
          chatId: data.chat.chatId,
          roomId: getRoomId,
          senderId: loginUserId,
          receiverId: selectedUser.id,
          message: message,
          timestamp: data.chat.createdAt,
        });
      }

      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
    }
  };

  useEffect(() => {
    if (!selectedUser?.id || !loginUserId) {
      return;
    }

    const getRoomId = roomId(loginUserId, selectedUser.id);
    const groupId = selectedUser.id; // Group ID is just the selected user's ID

    // Handler for group messages
    const handleReceiveGroupMessage = (data: GroupChat) => {
      console.log("📨 [ChatBox] Received GROUP message via socket:", data);
      console.log(
        "📨 [ChatBox] Group message from:",
        data.senderId,
        "Current user:",
        loginUserId
      );

      // Prevent duplicate: only add if senderId is NOT current user
      if (data.senderId !== loginUserId) {
        console.log(
          "✅ [ChatBox] Adding group message to state (from other user)"
        );
        setGroupChats((prev) => [
          ...prev,
          {
            ...data,
            createdAt: data.timestamp, // normalize
          },
        ]);
      } else {
        console.log("⏭️ [ChatBox] Skipping group message (from self)");
      }
    };

    // Handler for private messages
    const handleReceiveMessage = (data: Chat) => {
      console.log("📨 [ChatBox] Received PRIVATE message via socket:", data);
      console.log(
        "📨 [ChatBox] Message from:",
        data.senderId,
        "Current user:",
        loginUserId
      );

      // Prevent duplicate: only add if senderId is NOT current user
      if (data.senderId !== loginUserId) {
        console.log("✅ [ChatBox] Adding message to state (from other user)");
        setChats((prev) => [
          ...prev,
          {
            ...data,
            createdAt: data.timestamp, // normalize
          },
        ]);
      } else {
        console.log("⏭️ [ChatBox] Skipping message (from self)");
      }
    };

    // Listen for messages BEFORE joining room
    if (selectedUser.type === "private") {
      socket.socket?.on("new-message", handleReceiveMessage);
      console.log("🎧 [ChatBox] Listening for PRIVATE messages");
      // Join private room
      socket.socket?.emit("join-room", { roomId: getRoomId });
      console.log("📍 [ChatBox] Joined PRIVATE room:", getRoomId);
    } else if (selectedUser.type === "group") {
      socket.socket?.on("new-group-message", handleReceiveGroupMessage);
      console.log("🎧 [ChatBox] Listening for GROUP messages");
      // Join group room
      socket.socket?.emit("join-group-room", { groupId: groupId });
      console.log("📍 [ChatBox] Joined GROUP room:", groupId);
    }

    // Fetch chat history
    const getData = async () => {
      try {
        let response;
        if (selectedUser.type === "group") {
          response = await fetch("/api/group/get-group-chat", {
            method: "POST",
            body: JSON.stringify({
              groupId: selectedUser.id,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          console.log("📜 [ChatBox] Group chat response:", data);
          if (data.success) {
            setGroupChats(data.data);
            console.log(
              "📜 [ChatBox] Loaded group chat history:",
              data.data.length,
              "messages"
            );
          }
        } else if (selectedUser.type === "private") {
          response = await fetch("/api/chat/get-chat-with-current-user", {
            method: "POST",
            body: JSON.stringify({
              receiverId: selectedUser.id,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          if (data.success) {
            setChats(data.data);
            console.log(
              "📜 [ChatBox] Loaded chat history:",
              data.data.length,
              "messages"
            );
          }
        }
      } catch (error) {
        console.error("Get chats error:", error);
      }
    };
    getData();

    // Cleanup listener when component unmounts or selectedUser changes
    return () => {
      if (selectedUser.type === "private") {
        socket.socket?.off("new-message", handleReceiveMessage);
        console.log("🧹 [ChatBox] Cleaned up PRIVATE message listener");
      } else if (selectedUser.type === "group") {
        socket.socket?.off("new-group-message", handleReceiveGroupMessage);
        console.log("🧹 [ChatBox] Cleaned up GROUP message listener");
      }
    };
  }, [selectedUser?.id, loginUserId, socket.socket]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth", // <- this makes it smooth
      });
    }
  }, [chats]);

  // If no user is selected, show welcome screen
  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="mb-8 relative">
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl">
                <MessageSquare
                  size={80}
                  className="text-white"
                  strokeWidth={1.5}
                />
              </div>
              <div className="absolute top-0 right-20 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute bottom-0 left-20 w-16 h-16 bg-green-400 rounded-full opacity-20 animate-pulse delay-75"></div>
            </div>

            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to Chatify
            </h1>

            <p className="text-gray-600 text-lg mb-8">
              Connect with your friends and start chatting instantly
            </p>

            <div className="grid grid-cols-1 gap-4 text-left bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users size={20} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Select a Contact
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose someone from your contacts to start chatting
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Instant Messaging
                  </h3>
                  <p className="text-sm text-gray-600">
                    Send and receive messages in real-time
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Private & Secure
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your conversations are protected and encrypted
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-sm mt-6">
              👈 Select a contact from the sidebar to begin
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <Header selectedChatUser={selectedUser} />
      <div ref={chatContainerRef} className="flex-1 px-4 py-2 overflow-y-auto">
        <div className="flex flex-col gap-y-2">
          {selectedUser.type === "private" ? (
            chats.length > 0 ? (
              chats.map((chat, index) => (
                <div
                  key={chat.chatId || index}
                  className={`flex ${
                    chat.senderId === loginUserId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[65%] px-3 py-2 rounded-lg shadow-sm ${
                      chat.senderId === loginUserId
                        ? "bg-chat-sent rounded-br-none"
                        : "bg-chat-received rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm break-words">{chat.message}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
                      <span>{getDate(chat.createdAt)}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-black text-center">No chats found</div>
            )
          ) : selectedUser.type === "group" ? (
            groupChat.length > 0 ? (
              groupChat.map((chat, index) => (
                <div
                  key={chat.chatId || index}
                  className={`flex ${
                    chat.senderId === loginUserId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[65%] px-3 py-2 rounded-lg shadow-sm ${
                      chat.senderId === loginUserId
                        ? "bg-chat-sent rounded-br-none"
                        : "bg-chat-received rounded-bl-none"
                    }`}
                  >
                    {/* Show sender name for group messages from others */}
                    {chat.senderId !== loginUserId && (
                      <p className="text-xs font-semibold text-teal-600 mb-1">
                        {chat.senderId}
                      </p>
                    )}
                    <p className="text-sm break-words">{chat.message}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
                      <span>{getDate(chat.createdAt)}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-black text-center">No group chats found</div>
            )
          ) : null}
        </div>
      </div>

      <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 ">
        <div className="flex items-center gap-2">
          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2">
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
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            placeholder="Type a message"
            className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#008069]"
          />
          <button
            onClick={() => {
              handleSendMessage(message);
            }}
            className="bg-[#008069] text-white p-2 rounded-full hover:bg-[#007a5a]"
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
      </div>
    </div>
  );
};

export default ChatBox;
