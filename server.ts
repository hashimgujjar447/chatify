import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Track online users (userId -> set of socketIds)
const onlineUsers = new Map<string, Set<string>>();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url ?? "/", true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: dev ? "http://localhost:3000" : process.env.NEXT_PUBLIC_APP_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", async (socket) => {
    const userId = socket.handshake.auth.userId as string;
    if (!userId) return;

    console.log("Connected user:", userId, "Socket ID:", socket.id);

    // Add socket to onlineUsers
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)!.add(socket.id);

    // Update Prisma if first connection
    if (onlineUsers.get(userId)!.size === 1) {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true },
      });
      io.emit("user-online", { userId });
    }

    // Join room
    socket.on("join-room", ({ roomId }) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
      socket.to(roomId).emit("user-join", { userId });
    });

    socket.on("join-group-room", ({ groupId }) => {
      socket.join(groupId);
      console.log(`🚪 [SERVER] User ${userId} joined GROUP room: ${groupId}`);
      console.log(
        `👥 [SERVER] Group ${groupId} now has ${
          io.sockets.adapter.rooms.get(groupId)?.size || 0
        } users`
      );
      socket.to(groupId).emit("user-join-group", { userId });
    });

    // Send private message
    socket.on(
      "send-message",
      ({ roomId, senderId, receiverId, message, chatId, timestamp }) => {
        console.log(
          "📨 [SERVER] Private message received:",
          message,
          "Room:",
          roomId
        );
        io.to(roomId).emit("new-message", {
          roomId,
          senderId,
          receiverId,
          message,
          chatId,
          timestamp,
        });
      }
    );

    // Send group message
    socket.on(
      "send-group-message",
      ({ groupId, senderId, message, chatId, timestamp }) => {
        console.log(
          "📨 [SERVER] Group message received:",
          message,
          "Group:",
          groupId
        );
        console.log(
          `👥 [SERVER] Broadcasting to ${
            io.sockets.adapter.rooms.get(groupId)?.size || 0
          } users`
        );
        io.to(groupId).emit("new-group-message", {
          groupId,
          senderId,
          message,
          chatId,
          timestamp,
        });
      }
    );

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log("Socket disconnected:", socket.id);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          await prisma.user.update({
            where: { id: userId },
            data: { isOnline: false },
          });
          io.emit("user-offline", { userId });
        }
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready on http://${hostname}:${port}`);
    console.log(`🔌 Socket.IO ready on ws://${hostname}:${port}`);
  });
});
