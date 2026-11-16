import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import http from "node:http";
import { Server } from "socket.io";
import { MessageModel } from "./models/message.model.js";
import { ChatModel } from "./models/chat.model.js";
import { UserModal } from "./models/user.model.js";

const PORT = process.env.PORT || 4000;

const server = async (): Promise<void> => {
  try {
    await connectDB();

    // 1. create HTTP server from Express
    const httpServer = http.createServer(app);

    // 2. Attach Socket.IO to the HTTP server
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });

    // 3. Socket event handlers
    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // when user leaves a chat screen
      socket.on("join_chat", (chatId: string) => {
        socket.join(chatId);
        console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
      });

      // when user leaves a chat screen
      socket.on("leave_chat", (chatId: string) => {
        socket.leave(chatId);
        console.log(`Socket ${socket.id} left chat room: ${chatId}`);
      });

      // when user sends a message in real-time
      socket.on(
        "send_message",
        async (data: { chatId: string; senderId: string; text: string }) => {
          try {
            const { chatId, senderId, text } = data;

            if (!chatId || !senderId || !text?.trim()) return;

            // 1. Save message to MongoDB
            const newMessage = await MessageModel.create({
              chatId,
              sender: senderId,
              text: text.trim(),
            });

            // 2. Update lastMessage on Chat
            await ChatModel.findByIdAndUpdate(chatId, {
              lastMessage: newMessage._id,
            });

            // 3. Populate sender info and Broadcast the new message to everyone in the chat room!
            const populatedMessage = await newMessage.populate(
              "sender",
              "_id name email",
            );
            io.to(chatId).emit("receive_message", populatedMessage);

            // 4. Send push notification
            const chat = await ChatModel.findById(chatId);
            const recipentId = chat?.participants.find(
              (p) => p.toString() !== senderId,
            );
            const recipent = await UserModal.findById(recipentId);
            const sender = await UserModal.findById(senderId);

            const room = io.sockets.adapter.rooms.get(chatId);
            const isRecipientInRoom = room && room.size >= 2;

            if (!isRecipientInRoom && recipent?.pushToken) {
              await fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  to: recipent.pushToken,
                  title: sender?.name || "New Message",
                  body: text,
                  sound: "default",
                  data: { chatId: chatId },
                }),
              });
            }
          } catch (error) {
            console.log("Socket send_message error:", error);
          }
        },
      );

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server", error);
    process.exit(1);
  }
};

server();