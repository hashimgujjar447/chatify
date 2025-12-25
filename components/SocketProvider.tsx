"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch } from "react-redux";
import { setSocket, clearSocket } from "@/store/features/socket/socketSlice";
import { useAppSelecter } from "@/store/hooks/hooks";

export const SocketInitializer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useDispatch();
  const user = useAppSelecter((state) => state.user.user);

  useEffect(() => {
    if (!user?.userId) return;

    const socket: Socket = io("http://localhost:3000", {
      path: "/socket.io",
      transports: ["websocket"],
      auth: { userId: user.userId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected! ID:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected. Reason:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    // Listen for incoming messages
    socket.on("new-message", (data) => {
      console.log("📨 New message received:", data);
    });

    // Listen for online/offline updates
    socket.on("user-online", ({ userId }) => {
      console.log(`🟢 User online: ${userId}`);
    });

    socket.on("user-offline", ({ userId }) => {
      console.log(`🔴 User offline: ${userId}`);
    });

    dispatch(setSocket(socket));

    return () => {
      socket.disconnect();
      dispatch(clearSocket());
    };
  }, [dispatch, user?.userId]);

  return <>{children}</>;
};
