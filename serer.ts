import { Server } from "socket.io";
import { createServer } from "http";

const PORT = 3000;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Next.js frontend
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  // Join a specific room
  socket.on("joinroom", (roomId: string) => {
    socket.join(roomId);
    console.log(`✅ ${socket.id} joined room: ${roomId}`);
    // Optional: notify others
    socket.to(roomId).emit("userJoined", socket.id);
  });

  // Send message to a room
  socket.on("sendMessage", (roomId: string, message: string) => {
    io.to(roomId).emit("newMessage", {
      message,
      sender: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
});
