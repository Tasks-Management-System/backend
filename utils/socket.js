// utils/socket.js

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import ChatMessage from "../model/chat.model.js";
import { pubClient, subClient } from "./redis.js";
import { createAdapter } from "@socket.io/redis-adapter";

/**
 * Redis Key:
 * "online_users" -> Set of userIds
 *
 * Why Redis?
 * - Shared across multiple servers
 * - Replaces local Map (which breaks in scaling)
 */

/**
 * Get online users from Redis
 */
export async function getOnlineUsers() {
  return await pubClient.smembers("online_users");
}

/**
 * Initialize Socket.IO server
 */
export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  /**
   * 🔥 IMPORTANT: Attach Redis adapter
   * This allows multiple backend servers to sync socket events
   */
  io.adapter(createAdapter(pubClient, subClient));

  /**
   * 🔐 AUTH MIDDLEWARE
   * - Runs before connection is established
   * - Verifies JWT token
   */
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach userId to socket for later use
      socket.userId = decoded.id;

      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  /**
   * 🔌 CONNECTION EVENT
   * Runs when user connects via socket
   */
  io.on("connection", async (socket) => {
    const userId = socket.userId;

    console.log("User connected:", userId);

    /**
     * ✅ 1. STORE ONLINE USER IN REDIS
     * Redis Set ensures unique user IDs
     */
    await pubClient.sadd("online_users", userId);

    /**
     * Notify all clients that user is online
     */
    io.emit("user:online", { userId });

    /**
     * ✅ 2. JOIN PERSONAL ROOM
     * Each user joins their own room (userId)
     * Used to send messages directly
     */
    socket.join(userId);

    /**
     * 💬 SEND MESSAGE
     */
    socket.on("message:send", async ({ receiverId, message }, callback) => {
      try {
        /**
         * 🔍 VALIDATION
         */
        if (!receiverId || !message?.trim()) {
          return callback?.({ success: false, error: "Invalid data" });
        }

        if (receiverId === userId) {
          return callback?.({ success: false, error: "Cannot message yourself" });
        }

        message = message.trim();

        /**
         * 💾 SAVE MESSAGE TO DATABASE (MongoDB)
         */
        const chatMessage = await ChatMessage.create({
          sender: userId,
          receiver: receiverId,
          message,
        });

        /**
         * Populate sender details (name, profile image)
         */
        const populated = await chatMessage.populate(
          "sender",
          "name profileImage"
        );

        /**
         * 📤 SEND MESSAGE TO RECEIVER
         * Using room = receiverId
         */
        io.to(receiverId).emit("message:receive", populated);

        /**
         * 📤 ALSO SEND TO SENDER (for real-time UI update)
         */
        io.to(userId).emit("message:receive", populated);

        /**
         * ✅ ACKNOWLEDGEMENT
         */
        callback?.({ success: true, data: populated });
      } catch (err) {
        console.error("Message error:", err);
        callback?.({ success: false, error: "Server error" });
      }
    });

    /**
     * ✍️ TYPING START
     */
    socket.on("typing:start", ({ receiverId }) => {
      io.to(receiverId).emit("typing:start", { userId });
    });

    /**
     * ✍️ TYPING STOP
     */
    socket.on("typing:stop", ({ receiverId }) => {
      io.to(receiverId).emit("typing:stop", { userId });
    });

    /**
     * ✅ MARK MESSAGES AS READ
     */
    socket.on("message:read", async ({ senderId }) => {
      await ChatMessage.updateMany(
        {
          sender: senderId,
          receiver: userId,
          isRead: false,
        },
        { isRead: true }
      );

      /**
       * Notify sender that messages are read
       */
      io.to(senderId).emit("message:read", { readBy: userId });
    });

    /**
     * 🔌 DISCONNECT EVENT
     */
    socket.on("disconnect", async () => {
      console.log("User disconnected:", userId);

      /**
       * ❌ REMOVE USER FROM REDIS
       */
      await pubClient.srem("online_users", userId);

      /**
       * Notify all clients
       */
      io.emit("user:offline", { userId });
    });
  });

  return io;
}