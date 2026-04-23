import ChatMessage from "../model/chat.model.js";
import User from "../model/user.model.js";
import { getOnlineUsers } from "../utils/socket.js";

// GET /api/v1/chat/:receiverId — paginated message history between two users
export const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage");

    const total = await ChatMessage.countDocuments({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    });

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/chat/users — users in the same org for chat (any authenticated user)
export const getChatUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    const role = Array.isArray(currentUser.role) ? currentUser.role[0] : currentUser.role;

    let query = { isActive: true };

    if (role === "super-admin") {
      // Super-admin sees everyone
    } else if (role === "admin") {
      // Admin sees users they manage + themselves
      query = {
        isActive: true,
        $or: [{ _id: currentUser._id }, { managedBy: currentUser._id }],
      };
    } else {
      // Employee/HR/Manager: find their admin, then show all users under that admin + the admin
      const adminId = currentUser.managedBy;
      if (adminId) {
        query = {
          isActive: true,
          $or: [{ _id: adminId }, { managedBy: adminId }],
        };
      } else {
        // No managedBy set — only show themselves
        query = { isActive: true, _id: currentUser._id };
      }
    }

    const users = await User.find(query)
      .select("name email profileImage role isActive")
      .lean();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/chat/online — list of currently connected user IDs
export const getOnlineUsersList = async (_req, res) => {
  try {
    const users = await getOnlineUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
