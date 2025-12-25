import { NextRequest } from "next/server";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    // Get the HTTP server from Next.js
    const httpServer = (req as any).socket?.server as HTTPServer;

    if (httpServer) {
      io = new SocketIOServer(httpServer, {
        path: "/api/socket",
        addTrailingSlash: false,
        cors: {
          origin:
            process.env.NODE_ENV === "production"
              ? process.env.NEXT_PUBLIC_APP_URL
              : "http://localhost:3000",
          methods: ["GET", "POST"],
          credentials: true,
        },
      });

      io.on("connection", (socket) => {
        console.log("✅ New client connected:", socket.id);

        socket.on("join-chat", (chatId: string) => {
          socket.join(chatId);
          console.log(`User ${socket.id} joined chat: ${chatId}`);
        });

        socket.on("send-message", (data) => {
          console.log("Message received:", data);
          io?.to(data.chatId).emit("receive-message", { chatId: data.chatId });
        });

        socket.on("disconnect", () => {
          console.log("❌ Client disconnected:", socket.id);
        });
      });

      console.log("🚀 Socket.IO server initialized");
    }
  }

  return new Response("Socket.IO server running", { status: 200 });
}
